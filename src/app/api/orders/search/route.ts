import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json([])
    }

    const ordenesTrabajos = await prisma.ordenTrabajo.findMany({
      where: {
        OR: [
          {
            numeroOrden: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            clienteNombre: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            estado: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            vehiculoMarca: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            vehiculoModelo: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            vehiculoPlaca: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            tecnicoAsignado: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            descripcion: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: {
        fechaIngreso: 'desc'
      },
      take: 50
    })

    return NextResponse.json(ordenesTrabajos)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}