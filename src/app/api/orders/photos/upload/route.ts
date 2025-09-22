import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { PrismaClient } from '@/generated/prisma'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

// Environment detection
const isProduction = process.env.NODE_ENV === 'production'

// Function to get the network path from PRM table
async function getNetworkImagePath(): Promise<string | null> {
  try {
    const result = await prisma.$queryRaw`
      SELECT VALPRM FROM PRM WHERE NOMPRM = 'CarpetaImagenes'
    ` as { VALPRM: string }[]
    
    if (result.length > 0 && result[0].VALPRM) {
      // Remove single quotes if present and return the path
      return result[0].VALPRM.replace(/'/g, '')
    }
    return null
  } catch (error) {
    console.error('Error reading PRM table:', error)
    return null
  }
}

// Function to create directory path based on environment
async function createUploadPath(orderNumber: string): Promise<string> {
  console.log(`Environment: ${isProduction ? 'production' : 'development'}`)
  
  if (isProduction) {
    // Try to get network path from PRM table
    const networkPath = await getNetworkImagePath()
    console.log(`Network path from PRM table: ${networkPath}`)
    
    if (!networkPath) {
      throw new Error('Network image path not configured in PRM table. Please add a record with NOMPRM = "CarpetaImagenes"')
    }
    
    try {
      // Create order-specific folder in network path
      // Handle Windows paths properly - use backslashes for Windows
      const orderFolder = networkPath.endsWith('\\') 
        ? `${networkPath}${orderNumber}`
        : `${networkPath}\\${orderNumber}`
      console.log(`Creating order folder at: ${orderFolder}`)
      
      // Check if directory exists, create if not
      if (!existsSync(orderFolder)) {
        await mkdir(orderFolder, { recursive: true })
        console.log(`Created directory: ${orderFolder}`)
      } else {
        console.log(`Directory already exists: ${orderFolder}`)
      }
      
      return orderFolder
    } catch (error) {
      console.error('Error accessing network path:', error)
      throw new Error(`Cannot access network image path: ${networkPath}. Please check network connectivity and permissions.`)
    }
  }
  
  // Development: use local storage
  const uploadsDir = join(process.cwd(), 'public', 'uploads', 'orders', orderNumber)
  console.log(`Using local storage path: ${uploadsDir}`)
  
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true })
    console.log(`Created local directory: ${uploadsDir}`)
  }
  
  return uploadsDir
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('photo') as File
    const orderNumber = formData.get('orderNumber') as string

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      )
    }

    if (!orderNumber) {
      return NextResponse.json(
        { message: 'Order number is required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { message: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const uniqueFilename = `${uuidv4()}.${fileExtension}`
    
    // Create upload path based on environment
    let uploadPath: string
    
    try {
      uploadPath = await createUploadPath(orderNumber)
    } catch (error) {
      console.error('Upload path creation error:', error)
      return NextResponse.json(
        { 
          message: error instanceof Error ? error.message : 'Failed to create upload path',
          error: 'NETWORK_PATH_ERROR'
        },
        { status: 500 }
      )
    }

    // Save file to filesystem
    // Handle Windows paths properly for file saving too
    const filePath = uploadPath.endsWith('\\') 
      ? `${uploadPath}${uniqueFilename}`
      : `${uploadPath}\\${uniqueFilename}`
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Generate file path for database storage
    const filePathForDB = isProduction 
      ? filePath // Store full network path in production
      : `/uploads/orders/${orderNumber}/${uniqueFilename}` // Store relative path in development

    // Store photo reference in database
    // For now, we'll store it in a simple way. In a real app, you might want to create a dedicated photos table
    // or extend the existing FOT table to link to orders
    
    // Get the order's entity ID to link the photo
    const orderDetails = await prisma.$queryRaw`
      SELECT ENTCAB FROM CAB WHERE NUMCAB = ${orderNumber}
    ` as { ENTCAB: number }[]

    if (orderDetails.length === 0) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      )
    }

    const entityId = orderDetails[0].ENTCAB

    // Insert photo record into FOT table
    const photoId = await prisma.$executeRaw`
      INSERT INTO FOT (ENTFOT, FEAFOT, NOTFOT, ALMFOT, PUEFOT)
      VALUES ((SELECT ISNULL(MAX(ENTFOT), 0) + 1 FROM FOT), GETDATE(), ${filePathForDB}, 1, 1)
    `

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      filename: file.name,
      filePath: filePathForDB,
      uploadedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Photo upload error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
