import { Client } from 'basic-ftp'
import { Readable } from 'stream'

export interface FTPConfig {
  host: string
  port: number
  user: string
  password: string
  basePath: string
  secure: boolean
}

export class FTPService {
  private client: Client
  private config: FTPConfig

  constructor(config: FTPConfig) {
    this.config = config
    this.client = new Client()
    this.client.ftp.verbose = process.env.NODE_ENV === 'development'
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
      console.error('❌ FTP connection failed:', error)
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
      // Convert to uppercase like PHP version (strtoupper)
      const upperPath = remotePath.toUpperCase()
      
      // Check if directory exists
      const exists = await this.directoryExists(upperPath)
      if (!exists) {
        // Create directory recursively
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
      // Convert to uppercase like PHP version (strtoupper)
      const upperPath = remotePath.toUpperCase()
      
      // Ensure the directory exists
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

  async listFiles(remotePath: string): Promise<string[]> {
    try {
      const files = await this.client.list(remotePath)
      return files.map(file => file.name)
    } catch (error) {
      console.error(`❌ Error listing files in: ${remotePath}`, error)
      return []
    }
  }

  async downloadFile(
    remotePath: string, 
    localPath: string
  ): Promise<boolean> {
    try {
      // Convert to uppercase like PHP version
      const upperRemotePath = remotePath.toUpperCase()
      
      // Check if remote directory exists
      const dirExists = await this.directoryExists(upperRemotePath)
      if (!dirExists) {
        console.log(`❌ Remote directory does not exist: ${upperRemotePath}`)
        return false
      }
      
      // Download the file
      await this.client.downloadTo(localPath, upperRemotePath)
      console.log(`✅ File downloaded successfully: ${upperRemotePath} -> ${localPath}`)
      return true
    } catch (error) {
      console.error(`❌ Error downloading file: ${remotePath}`, error)
      return false
    }
  }

  getFileUrl(remotePath: string): string {
    // Construct the URL to access the file via FTP
    const protocol = this.config.secure ? 'ftps' : 'ftp'
    return `${protocol}://${this.config.host}:${this.config.port}${remotePath}`
  }

  getHttpFileUrl(remotePath: string, httpBaseUrl?: string): string {
    // If you have an HTTP server serving FTP files, use this
    if (httpBaseUrl) {
      return `${httpBaseUrl}${remotePath}`
    }
    
    // Fallback to FTP URL
    return this.getFileUrl(remotePath)
  }
}

// Factory function to create FTP service from environment variables
export function createFTPService(): FTPService {
  const config: FTPConfig = {
    host: process.env.FTP_HOST || 'localhost',
    port: parseInt(process.env.FTP_PORT || '21'),
    user: process.env.FTP_USER || 'anonymous',
    password: process.env.FTP_PASSWORD || '',
    basePath: process.env.FTP_BASE_PATH || '/uploads/orders',
    secure: process.env.FTP_SECURE === 'true'
  }

  return new FTPService(config)
}

// Utility function to upload a photo to FTP
export async function uploadPhotoToFTP(
  fileBuffer: Buffer,
  orderNumber: string,
  filename: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const ftpService = createFTPService()
  
  try {
    await ftpService.connect()
    
    // Create order-specific directory path (uppercase like PHP strtoupper)
    const orderPath = `${ftpService['config'].basePath}/${orderNumber.toUpperCase()}`
    
    // Upload the file
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

// Utility function to delete a photo from FTP
export async function deletePhotoFromFTP(remotePath: string): Promise<{ success: boolean; error?: string }> {
  const ftpService = createFTPService()
  
  try {
    await ftpService.connect()
    await ftpService.deleteFile(remotePath)
    
    return { success: true }
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

// Utility function to download a photo from FTP (similar to PHP descargarFtp)
export async function downloadPhotoFromFTP(
  orderNumber: string,
  filename: string = 'imgdmg.png'
): Promise<{ success: boolean; localPath?: string; error?: string }> {
  const ftpService = createFTPService()
  
  try {
    await ftpService.connect()
    
    // Create order-specific directory path (uppercase like PHP)
    const orderPath = `${ftpService['config'].basePath}/${orderNumber.toUpperCase()}`
    const remoteFilePath = `${orderPath}/${filename}`
    const localPath = `./${orderNumber}/${filename}`
    
    // Download the file
    const success = await ftpService.downloadFile(remoteFilePath, localPath)
    
    if (success) {
      return {
        success: true,
        localPath: localPath
      }
    } else {
      return {
        success: false,
        error: 'File not found or download failed'
      }
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
