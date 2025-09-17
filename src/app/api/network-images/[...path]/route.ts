import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

// Function to get the network path from PRM table
async function getNetworkImagePath(): Promise<string | null> {
  try {
    const result = await prisma.$queryRaw`
      SELECT VALPRM FROM PRM WHERE NOMPRM = 'Carpetalmagenes'
    ` as any[]
    
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

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const imagePath = params.path.join('/')
    
    // Get network path from PRM table
    const networkPath = await getNetworkImagePath()
    
    if (!networkPath) {
      return NextResponse.json(
        { message: 'Network path not configured' },
        { status: 404 }
      )
    }
    
    // Construct full file path
    const fullPath = join(networkPath, imagePath)
    
    // Check if file exists
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { message: 'Image not found' },
        { status: 404 }
      )
    }
    
    // Read file
    const fileBuffer = await readFile(fullPath)
    
    // Determine content type based on file extension
    const extension = imagePath.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'png':
        contentType = 'image/png'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'webp':
        contentType = 'image/webp'
        break
      case 'svg':
        contentType = 'image/svg+xml'
        break
    }
    
    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    })
    
  } catch (error) {
    console.error('Error serving network image:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
