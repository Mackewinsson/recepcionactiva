import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { PrismaClient } from '@/generated/prisma'
import { v4 as uuidv4 } from 'uuid'

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
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'orders', orderNumber)
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Save file to filesystem
    const filePath = join(uploadsDir, uniqueFilename)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Generate public URL
    const publicUrl = `/uploads/orders/${orderNumber}/${uniqueFilename}`

    // Store photo reference in database
    // For now, we'll store it in a simple way. In a real app, you might want to create a dedicated photos table
    // or extend the existing FOT table to link to orders
    
    // Get the order's entity ID to link the photo
    const orderDetails = await prisma.$queryRaw`
      SELECT ENTCAB FROM CAB WHERE NUMCAB = ${orderNumber}
    ` as any[]

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
      VALUES (${entityId}, GETDATE(), ${publicUrl}, 1, 1)
    `

    return NextResponse.json({
      id: photoId,
      url: publicUrl,
      filename: file.name,
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



