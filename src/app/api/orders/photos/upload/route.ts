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

    // STEP 1: Check if order exists in database first
    const orderDetails = await prisma.$queryRaw`
      SELECT ENTCAB FROM CAB WHERE NUMCAB = ${orderNumber}
    ` as { ENTCAB: number }[]

    let entityId: number
    let isExistingOrder = false

    if (orderDetails.length > 0) {
      // Order exists - use existing order number and entity ID
      entityId = orderDetails[0].ENTCAB
      isExistingOrder = true
      console.log(`✅ Order ${orderNumber} exists, using existing folder`)
    } else {
      // Order doesn't exist - we'll create a new folder with this order number
      // For new orders, we'll use a default entity ID (you may want to adjust this logic)
      entityId = 1 // Default entity ID for new orders
      isExistingOrder = false
      console.log(`📁 Order ${orderNumber} doesn't exist, will create new folder`)
    }

    // STEP 2: Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const uniqueFilename = `${uuidv4()}.${fileExtension}`
    
    // STEP 3: Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // STEP 4: Upload to FTP server (this will create the folder if it doesn't exist)
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

    // STEP 5: Generate file path for database storage (relative path)
    const filePathForDB = `orders/${orderNumber}/${uniqueFilename}`

    // STEP 6: Get the next available ENTFOT ID and insert photo record into FOT table
    const maxId = await prisma.$queryRaw`
      SELECT ISNULL(MAX(ENTFOT), 0) + 1 AS NextId FROM FOT
    ` as { NextId: number }[]

    const nextId = maxId[0].NextId

    await prisma.$executeRaw`
      INSERT INTO FOT (ENTFOT, FEAFOT, NOTFOT, ALMFOT, PUEFOT)
      VALUES (${nextId}, GETDATE(), ${filePathForDB}, 1, 1)
    `

    return NextResponse.json({
      success: true,
      message: `Image uploaded successfully to FTP server${isExistingOrder ? ' (existing order)' : ' (new order folder created)'}`,
      id: nextId.toString(),
      url: uploadResult.url,
      filename: file.name,
      filePath: filePathForDB,
      orderExists: isExistingOrder,
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