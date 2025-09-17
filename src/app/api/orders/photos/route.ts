import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')

    if (!orderNumber) {
      return NextResponse.json(
        { message: 'Order number is required' },
        { status: 400 }
      )
    }

    // Get the order's entity ID
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

    // Get photos for this entity
    const photos = await prisma.$queryRaw`
      SELECT 
        ENTFOT as id,
        FEAFOT as uploadedAt,
        NOTFOT as url,
        FBJFOT as modifiedAt
      FROM FOT 
      WHERE ENTFOT = ${entityId} 
        AND NOTFOT IS NOT NULL 
        AND NOTFOT LIKE '/uploads/orders/%'
      ORDER BY FEAFOT DESC
    ` as any[]

    // Transform the results to match our interface
    const transformedPhotos = photos.map((photo, index) => ({
      id: `photo-${photo.id}-${index}`,
      url: photo.url,
      filename: photo.url.split('/').pop() || `photo-${index + 1}.jpg`,
      uploadedAt: photo.uploadedAt?.toISOString() || new Date().toISOString()
    }))

    return NextResponse.json(transformedPhotos)

  } catch (error) {
    console.error('Get photos error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}



