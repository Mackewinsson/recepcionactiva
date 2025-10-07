import { Client } from 'basic-ftp'
import { Readable } from 'stream'

interface FTPConfig {
  host: string
  port: number
  user: string
  password: string
  basePath: string
  secure: boolean
}

class FTPService {
  private client: Client
  private config: FTPConfig

  constructor() {
    this.client = new Client()
    this.config = {
      host: process.env.FTP_HOST || 'localhost',
      port: parseInt(process.env.FTP_PORT || '21'),
      user: process.env.FTP_USER || 'usermw',
      password: process.env.FTP_PASSWORD || 'usermw',
      basePath: process.env.FTP_BASE_PATH || '/uploads/orders',
      secure: process.env.FTP_SECURE === 'true'
    }
  }

  async connect(): Promise<void> {
    try {
      await this.client.access({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        secure: this.config.secure
      })
      console.log('✅ FTP connection established')
    } catch (error) {
      console.error('❌ Error connecting to FTP server:', error)
      throw new Error(`Failed to connect to FTP server: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async disconnect(): Promise<void> {
    try {
      this.client.close()
      console.log('✅ FTP connection closed')
    } catch (error) {
      console.error('❌ Error closing FTP connection:', error)
    }
  }

  async ensureDirectoryExists(remotePath: string): Promise<void> {
    try {
      // Convert to uppercase like PHP strtoupper() - EXACT PHP BEHAVIOR
      const upperPath = remotePath.toUpperCase()
      
      // Check if directory exists
      const exists = await this.directoryExists(upperPath)
      if (!exists) {
        // Create directory recursively - like PHP ftp_mkdir()
        await this.client.ensureDir(upperPath)
        console.log(`✅ Created FTP directory: ${upperPath}`)
      } else {
        console.log(`✅ FTP directory already exists: ${upperPath}`)
      }
    } catch (error) {
      console.error(`❌ Error ensuring directory exists: ${remotePath}`, error)
      throw new Error(`Failed to create directory ${remotePath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async directoryExists(remotePath: string): Promise<boolean> {
    try {
      await this.client.cd(remotePath)
      return true
    } catch (error) {
      return false
    }
  }

  async uploadFile(
    localBuffer: Buffer, 
    remotePath: string, 
    filename: string
  ): Promise<string> {
    try {
      // Convert to uppercase like PHP strtoupper() - EXACT PHP BEHAVIOR
      const upperPath = remotePath.toUpperCase()
      
      // Ensure the directory exists (like PHP ftp_mkdir)
      await this.ensureDirectoryExists(upperPath)
      
      // Create a readable stream from the buffer
      const stream = new Readable()
      stream.push(localBuffer)
      stream.push(null)
      
      // Upload the file using binary mode (like PHP FTP_BINARY)
      const fullRemotePath = `${upperPath}/${filename}`
      await this.client.uploadFrom(stream, fullRemotePath)
      
      console.log(`✅ File uploaded successfully: ${fullRemotePath}`)
      return fullRemotePath
    } catch (error) {
      console.error(`❌ Error uploading file: ${filename}`, error)
      throw new Error(`Failed to upload file ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deleteFile(remotePath: string): Promise<void> {
    try {
      await this.client.remove(remotePath)
      console.log(`✅ File deleted successfully: ${remotePath}`)
    } catch (error) {
      console.error(`❌ Error deleting file: ${remotePath}`, error)
      throw new Error(`Failed to delete file ${remotePath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async downloadFile(remotePath: string): Promise<Buffer> {
    try {
      const chunks: Buffer[] = []
      const { Writable } = await import('stream')
      
      const writableStream = new Writable({
        write(chunk, encoding, callback) {
          chunks.push(chunk)
          callback()
        }
      })
      
      // Download file (like PHP ftp_get with FTP_ASCII mode)
      await this.client.downloadTo(writableStream, remotePath)
      
      return Buffer.concat(chunks)
    } catch (error) {
      console.error(`❌ Error downloading file: ${remotePath}`, error)
      throw new Error(`Failed to download file ${remotePath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  getHttpFileUrl(remotePath: string, baseUrl?: string): string {
    if (!baseUrl) {
      return remotePath
    }
    
    // Convert FTP path to HTTP URL
    // Remove the base path from the remote path to get the relative path
    const relativePath = remotePath.replace(this.config.basePath, '').replace(/^\//, '')
    return `${baseUrl}/${relativePath}`
  }
}

// Factory function to create FTP service instance
export function createFTPService(): FTPService {
  return new FTPService()
}

// Utility function to upload photo to FTP - EXACT PHP BEHAVIOR
export async function uploadPhotoToFTP(
  fileBuffer: Buffer,
  orderNumber: string,
  filename: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const ftpService = createFTPService()
  
  try {
    await ftpService.connect()
    
    // Create order-specific directory path with UPPERCASE like PHP strtoupper()
    // PHP creates directories in root, not in base path
    const orderPath = orderNumber.toUpperCase()
    
    // Upload the file (this will create the directory if it doesn't exist)
    const remotePath = await ftpService.uploadFile(fileBuffer, orderPath, filename)
    
    // Generate URL for the uploaded file
    const fileUrl = ftpService.getHttpFileUrl(remotePath, process.env.FTP_HTTP_BASE_URL)
    
    return {
      success: true,
      url: fileUrl
    }
  } catch (error) {
    console.error('FTP upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  } finally {
    await ftpService.disconnect()
  }
}

// Utility function to download photo from FTP - EXACT PHP BEHAVIOR
export async function downloadPhotoFromFTP(
  orderNumber: string,
  filename: string = 'imgdmg.png'
): Promise<{ success: boolean; buffer?: Buffer; error?: string }> {
  const ftpService = createFTPService()
  
  try {
    await ftpService.connect()
    
    // Convert order number to uppercase like PHP strtoupper()
    const upperOrderNumber = orderNumber.toUpperCase()
    
    // Check if directory exists (like PHP is_dir check)
    const directoryExists = await ftpService.directoryExists(upperOrderNumber)
    if (!directoryExists) {
      return {
        success: false,
        error: `Directory ${upperOrderNumber} does not exist`
      }
    }
    
    // Download the file (like PHP ftp_get)
    const remotePath = `${upperOrderNumber}/${filename}`
    const buffer = await ftpService.downloadFile(remotePath)
    
    return {
      success: true,
      buffer
    }
  } catch (error) {
    console.error('FTP download error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  } finally {
    await ftpService.disconnect()
  }
}

// Utility function to delete photo from FTP - EXACT PHP BEHAVIOR
export async function deletePhotoFromFTP(
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  const ftpService = createFTPService()
  
  try {
    await ftpService.connect()
    
    // Convert file path to uppercase like PHP strtoupper()
    const upperFilePath = filePath.toUpperCase()
    
    // Delete the file (like PHP ftp_delete)
    await ftpService.deleteFile(upperFilePath)
    
    return {
      success: true
    }
  } catch (error) {
    console.error('FTP delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  } finally {
    await ftpService.disconnect()
  }
}