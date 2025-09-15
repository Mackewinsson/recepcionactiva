import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json([])
    }

    // Search orders by number or client name using raw SQL
    const orders = await prisma.$queryRaw`
      SELECT TOP 20
        c.NUMCAB as numeroOrden,
        c.FECCAB as fecha,
        c.ESTCAB as estado,
        c.TOTCAB as total,
        e.NCOENT as cliente
      FROM CAB c
      LEFT JOIN ENT e ON c.ENTCAB = e.IDEENT
      WHERE c.NUMCAB LIKE ${'%' + query + '%'} 
         OR e.NCOENT LIKE ${'%' + query + '%'}
      ORDER BY c.FECCAB DESC
    `

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}