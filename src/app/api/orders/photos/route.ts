import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { listPhotosFromFTP } from '@/lib/ftp-service'

const prisma = new PrismaClient()

interface OrderEntity {
  ENTCAB: number;
}

interface PhotoData {
  id: number;
  uploadedAt: Date;
  url: string;
  modifiedAt: Date | null;
}

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
    ` as OrderEntity[]

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
    ` as PhotoData[]

    // Transform database photos
    const transformedPhotos = photos.map((photo, index) => ({
      id: `photo-${photo.id}-${index}`,
      url: photo.url,
      filename: photo.url.split('/').pop() || `photo-${index + 1}.jpg`,
      uploadedAt: photo.uploadedAt?.toISOString() || new Date().toISOString(),
      source: 'database' // Track source for debugging
    }))

    // NEW: Also check FTP folder for additional files
    try {
      const ftpResult = await listPhotosFromFTP(orderNumber)
      
      if (ftpResult.success && ftpResult.files && ftpResult.files.length > 0) {
        const baseUrl = process.env.FTP_HTTP_BASE_URL || '/uploads'
        
        // Add FTP files that aren't already in database
        ftpResult.files.forEach((filename, index) => {
          const fileUrl = `${baseUrl}/${orderNumber.toUpperCase()}/${filename}`
          
          // Check if this file is already in the database results
          const alreadyExists = transformedPhotos.some(p => p.filename === filename)
          if (!alreadyExists) {
            transformedPhotos.push({
              id: `ftp-${filename}-${index}`,
              url: fileUrl,
              filename: filename,
              uploadedAt: new Date().toISOString(),
              source: 'ftp' // Track source for debugging
            })
          }
        })
        
        console.log(`📊 Total photos: ${transformedPhotos.length} (${photos.length} from DB, ${ftpResult.files.length} from FTP)`)
      } else if (!ftpResult.success) {
        // FTP failed but don't break the response - still return DB photos
        console.warn(`⚠️ FTP listing failed: ${ftpResult.error}, returning database photos only`)
      }
    } catch (ftpError) {
      // Edge case: FTP check fails completely - log but continue with DB photos
      console.error('❌ Failed to check FTP folder:', ftpError)
      console.log('📋 Returning database photos only')
    }

    return NextResponse.json(transformedPhotos)

  } catch (error) {
    console.error('Get photos error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}



