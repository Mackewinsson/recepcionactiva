'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useCompanyName } from '@/hooks/useCompanyName'

export default function Dashboard() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const companyName = useCompanyName()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Company Section */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <div className="text-xs font-medium text-blue-100 uppercase tracking-wide">Empresa</div>
                <h1 className="text-lg font-bold text-white sm:text-xl truncate">{companyName}</h1>
              </div>
            </div>

            {/* User Section */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-4 sm:border-l sm:border-blue-500 sm:pl-4">
                <div className="flex flex-col items-start sm:items-end">
                  <div className="text-xs font-medium text-blue-100 uppercase tracking-wide">Usuario</div>
                  <span className="text-sm font-semibold text-white">{user?.name || `Usuario ${user?.userId}`}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-5 sm:py-2.5"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            
            {/* Órdenes de Trabajo Card */}
            <div className="rounded-lg border bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <span className="text-2xl">📋</span>
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-900 sm:text-lg">Vehículos</h3>
                  <p className="text-sm text-gray-500">Buscar vehículos por matrícula o número de orden</p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => router.push('/orders')}
                  className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                >
                  Ver Órdenes
                </button>
              </div>
            </div>


            {/* Clientes Card - Commented out for now */}
            {/* <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Clientes</h3>
                  <p className="text-sm text-gray-500">Gestionar clientes</p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
                >
                  Próximamente
                </button>
              </div>
            </div> */}

            {/* Reportes Card - Commented out for now */}
            {/* <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Reportes</h3>
                  <p className="text-sm text-gray-500">Ver estadísticas</p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
                >
                  Próximamente
                </button>
              </div>
            </div> */}

            {/* Inventario Card - Commented out for now */}
            {/* <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Inventario</h3>
                  <p className="text-sm text-gray-500">Gestionar stock</p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
                >
                  Próximamente
                </button>
              </div>
            </div> */}

            {/* Configuración Card - Commented out for now */}
            {/* <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⚙️</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Configuración</h3>
                  <p className="text-sm text-gray-500">Ajustes del sistema</p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
                >
                  Próximamente
                </button>
              </div>
            </div> */}

        </div>

        {/* Quick Stats - Commented out for now */}
        {/* <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Resumen Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">16</div>
              <div className="text-sm text-gray-500">Órdenes Totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">4</div>
              <div className="text-sm text-gray-500">Pendientes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-sm text-gray-500">En Proceso</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">9</div>
              <div className="text-sm text-gray-500">Completadas</div>
            </div>
          </div>
        </div> */}
      </main>
    </div>
  )
}
