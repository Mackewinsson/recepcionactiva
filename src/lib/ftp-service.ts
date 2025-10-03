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
      // For local development, skip directory creation due to Docker permission limitations
      // In production, this would create directories as needed
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔧 Development mode: Skipping directory creation for ${remotePath}`)
        return
      }
      
      // Production mode: Create directories with uppercase paths like PHP version
      const actualPath = remotePath.toUpperCase()
      
      // Check if directory exists
      const exists = await this.directoryExists(actualPath)
      if (!exists) {
        // Create directory recursively
        await this.client.ensureDir(actualPath)
        console.log(`✅ Created FTP directory: ${actualPath}`)
      } else {
        console.log(`✅ FTP directory already exists: ${actualPath}`)
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
      // For local development, use root directory due to Docker permission limitations
      // In production, use uppercase paths like PHP version
      const actualPath = process.env.NODE_ENV === 'development' 
        ? '/'
        : remotePath.toUpperCase()
      
      // Ensure the directory exists (will be skipped in development)
      await this.ensureDirectoryExists(actualPath)
      
      // Create a readable stream from the buffer
      const stream = new Readable()
      stream.push(localBuffer)
      stream.push(null)
      
      // Upload the file using binary mode (like PHP FTP_BINARY)
      const fullRemotePath = `${actualPath}${filename}`
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
      const stream = new Readable()
      
      await this.client.downloadTo(stream, remotePath)
      
      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk))
        stream.on('end', () => resolve(Buffer.concat(chunks)))
        stream.on('error', reject)
      })
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
    // For development, files are in root directory
    if (process.env.NODE_ENV === 'development') {
      const filename = remotePath.replace('/', '')
      return `${baseUrl}/${filename}`
    }
    
    // For production, remove the base path from the remote path to get the relative path
    const relativePath = remotePath.replace(this.config.basePath, '').replace(/^\//, '')
    return `${baseUrl}/${relativePath}`
  }
}

// Factory function to create FTP service instance
export function createFTPService(): FTPService {
  return new FTPService()
}

// Utility function to upload photo to FTP
export async function uploadPhotoToFTP(
  fileBuffer: Buffer,
  orderNumber: string,
  filename: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const ftpService = createFTPService()
  
  try {
    await ftpService.connect()
    
    // For local development, upload to root directory due to Docker permission limitations
    // In production, use uppercase like PHP strtoupper with subdirectories
    const orderPath = process.env.NODE_ENV === 'development'
      ? '/'
      : `${ftpService['config'].basePath}/${orderNumber.toUpperCase()}`
    
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

// Utility function to download photo from FTP
export async function downloadPhotoFromFTP(
  remotePath: string
): Promise<{ success: boolean; buffer?: Buffer; error?: string }> {
  const ftpService = createFTPService()
  
  try {
    await ftpService.connect()
    
    // Convert path to uppercase for consistency with PHP version
    const actualPath = remotePath.toUpperCase()
    
    // Download the file
    const buffer = await ftpService.downloadFile(actualPath)
    
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