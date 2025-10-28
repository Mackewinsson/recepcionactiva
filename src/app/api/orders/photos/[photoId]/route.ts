import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deletePhotoFromFTP } from '@/lib/ftp-service'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const { photoId } = await params

    if (!photoId) {
      return NextResponse.json(
        { message: 'ID de foto es requerido' },
        { status: 400 }
      )
    }

    // Get photo information from database
    const photoData = await prisma.$queryRaw`
      SELECT NOTFOT FROM FOT WHERE ENTFOT = ${parseInt(photoId)}
    ` as { NOTFOT: string }[]

    if (photoData.length === 0) {
      return NextResponse.json(
        { message: 'Foto no encontrada' },
        { status: 404 }
      )
    }

    const filePath = photoData[0].NOTFOT

    // Delete from FTP server
    const deleteResult = await deletePhotoFromFTP(filePath)
    
    if (!deleteResult.success) {
      console.error('FTP delete failed:', deleteResult.error)
      return NextResponse.json(
        { 
          message: deleteResult.error || 'Error al eliminar foto del servidor FTP',
          error: 'FTP_DELETE_ERROR'
        },
        { status: 500 }
      )
    }

    // Delete from database
    await prisma.$executeRaw`
      DELETE FROM FOT WHERE ENTFOT = ${parseInt(photoId)}
    `
    
    return NextResponse.json({
      message: 'Foto eliminada exitosamente del servidor FTP y base de datos',
      id: photoId
    })

  } catch (error) {
    console.error('Delete photo error:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}



