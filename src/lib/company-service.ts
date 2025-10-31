import { prisma } from './prisma'

/**
 * Obtiene el nombre de la empresa principal desde la base de datos
 * Busca el parámetro 'EmprGest' en la tabla PRM, obtiene el ID desde VALPRM
 * y hace un INNER JOIN con la tabla ENT para obtener el nombre
 * 
 * @returns Promise<string> - El nombre de la empresa o 'Empresa' como fallback
 */
export async function getCompanyName(): Promise<string> {
  try {
    // Buscar el parámetro EmprGest en la tabla PRM, obtener VALPRM (ID de la empresa)
    // y hacer INNER JOIN con ENT para obtener el nombre
    const empresaResult = await prisma.$queryRaw<Array<{ 
      VALPRM: string | null,
      NCOENT: string | null,
      NOMENT: string | null
    }>>`
      SELECT 
        p.VALPRM,
        e.NCOENT,
        e.NOMENT
      FROM PRM p
      INNER JOIN ENT e ON CAST(p.VALPRM AS INT) = e.IDEENT
      WHERE p.NOMPRM = 'EmprGest'
    `

    if (!empresaResult || empresaResult.length === 0) {
      console.warn('Parámetro EmprGest no encontrado en la tabla PRM o no hay coincidencia en ENT')
      return 'Empresa'
    }

    const empresa = empresaResult[0]
    console.log('🔍 VALPRM (ID):', empresa.VALPRM)
    console.log('🔍 NCOENT:', empresa.NCOENT)
    console.log('🔍 NOMENT:', empresa.NOMENT)

    // Usar NCOENT (nombre comercial) como primera opción, o NOMENT como fallback
    const companyName = empresa.NCOENT || empresa.NOMENT || 'Empresa'
    console.log('✅ Company name:', companyName)

    return companyName.trim()

  } catch (error) {
    console.error('Error al obtener el nombre de la empresa:', error)
    return 'Empresa'
  }
}

/**
 * Obtiene información completa de la empresa principal
 * 
 * @returns Promise<{id: number, nombreComercial: string, nombre: string | null} | null>
 */
export async function getCompanyInfo(): Promise<{
  id: number
  nombreComercial: string
  nombre: string | null
} | null> {
  try {
    // Buscar el parámetro EmprGest en la tabla PRM y hacer INNER JOIN con ENT
    const empresaResult = await prisma.$queryRaw<Array<{ 
      IDEENT: number,
      VALPRM: string | null,
      NCOENT: string | null,
      NOMENT: string | null
    }>>`
      SELECT 
        e.IDEENT,
        p.VALPRM,
        e.NCOENT,
        e.NOMENT
      FROM PRM p
      INNER JOIN ENT e ON CAST(p.VALPRM AS INT) = e.IDEENT
      WHERE p.NOMPRM = 'EmprGest'
    `

    if (!empresaResult || empresaResult.length === 0) {
      console.warn('Parámetro EmprGest no encontrado en la tabla PRM o no hay coincidencia en ENT')
      return null
    }

    const empresa = empresaResult[0]

    return {
      id: empresa.IDEENT,
      nombreComercial: empresa.NCOENT || '',
      nombre: empresa.NOMENT
    }

  } catch (error) {
    console.error('Error al obtener la información de la empresa:', error)
    return null
  }
}
