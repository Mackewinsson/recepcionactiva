import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { userId, password } = await request.json()

    if (!userId || !password) {
      return NextResponse.json(
        { message: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // For now, we'll use a simple password check
    // In a real system, you'd want to implement proper authentication
    const validPasswords = ['sa2006', 'admin', '123456']
    
    if (!validPasswords.includes(password)) {
      return NextResponse.json(
        { message: 'Contraseña inválida' },
        { status: 401 }
      )
    }

    // Get user information from the database
    const userData = await prisma.$queryRaw`
      SELECT 
        u.ENTUSU as userId,
        u.ACCUSU as accessLevel,
        u.ADMUSU as adminLevel,
        u.FEAUSU as createdAt,
        e.NCOENT as entityName,
        e.IDEENT as entityId
      FROM USU u
      LEFT JOIN ENT e ON u.ENTUSU = e.USUENT
      WHERE u.ENTUSU = ${parseInt(userId)}
    `

    if (!userData || (userData as Array<{
      userId: number;
      accessLevel: number;
      adminLevel: number;
      createdAt: Date;
      entityName: string | null;
      entityId: number | null;
    }>).length === 0) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 401 }
      )
    }

    const user = (userData as Array<{
      userId: number;
      accessLevel: number;
      adminLevel: number;
      createdAt: Date;
      entityName: string | null;
      entityId: number | null;
    }>)[0]
    
    // Get all entities for this user
    const entities = await prisma.$queryRaw`
      SELECT IDEENT as id, NCOENT as name
      FROM ENT
      WHERE USUENT = ${parseInt(userId)}
    `

    const userInfo = {
      id: user.userId.toString(),
      userId: user.userId,
      accessLevel: user.accessLevel,
      adminLevel: user.adminLevel,
      name: user.entityName || `Usuario ${user.userId}`,
      entities: entities as Array<{ id: number; name: string }>,
      createdAt: user.createdAt
    }

    return NextResponse.json(userInfo)
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}