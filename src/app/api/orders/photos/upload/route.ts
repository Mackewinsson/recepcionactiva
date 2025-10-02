import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { v4 as uuidv4 } from 'uuid'
import { uploadPhotoToFTP } from '@/lib/ftp-service'

const prisma = new PrismaClient()

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
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Upload to FTP server
    const uploadResult = await uploadPhotoToFTP(buffer, orderNumber, uniqueFilename)
    
    if (!uploadResult.success) {
      console.error('FTP upload failed:', uploadResult.error)
      return NextResponse.json(
        { 
          message: uploadResult.error || 'Failed to upload photo to FTP server',
          error: 'FTP_UPLOAD_ERROR'
        },
        { status: 500 }
      )
    }

    // Generate file path for database storage (relative path)
    const filePathForDB = `orders/${orderNumber}/${uniqueFilename}`

    // Store photo reference in database
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
      message: 'Image uploaded successfully to FTP server',
      id: uniqueFilename,
      url: uploadResult.url,
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