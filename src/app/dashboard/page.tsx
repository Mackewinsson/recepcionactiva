'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

interface OrdenTrabajo {
  id: string
  numeroOrden: string
  clienteNombre: string
  clienteTelefono?: string
  vehiculoMarca: string
  vehiculoModelo: string
  vehiculoAnio?: number
  vehiculoPlaca?: string
  descripcion: string
  estado: string
  montoTotal?: number
  fechaIngreso: string
  fechaEntrega?: string
  tecnicoAsignado?: string
}

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/orders/search?q=${encodeURIComponent(searchTerm)}`)
      if (response.ok) {
        const data = await response.json()
        setOrdenes(data)
      } else {
        console.error('Search failed')
        setOrdenes([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setOrdenes([])
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Búsqueda de Órdenes de Trabajo - Motos Muñoz</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name || user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Buscar por número de orden, cliente, vehículo, técnico, estado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
                >
                  {loading ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
            </form>

            {loading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            )}

            {!loading && hasSearched && (
              <div>
                <h3 className="text-lg font-medium mb-4">
                  Resultados de Búsqueda ({ordenes.length} órdenes encontradas)
                </h3>
                
                {ordenes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No se encontraron órdenes que coincidan con tu búsqueda.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            # Orden
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cliente
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vehículo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Técnico
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Monto
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha Ingreso
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {ordenes.map((orden) => (
                          <tr key={orden.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {orden.numeroOrden}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div>
                                <div className="font-medium">{orden.clienteNombre}</div>
                                {orden.clienteTelefono && (
                                  <div className="text-gray-500 text-xs">{orden.clienteTelefono}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div>
                                <div className="font-medium">{orden.vehiculoMarca} {orden.vehiculoModelo}</div>
                                <div className="text-gray-500 text-xs">
                                  {orden.vehiculoAnio && `${orden.vehiculoAnio} `}
                                  {orden.vehiculoPlaca && `- ${orden.vehiculoPlaca}`}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                orden.estado === 'completado' ? 'bg-green-100 text-green-800' :
                                orden.estado === 'en_proceso' ? 'bg-blue-100 text-blue-800' :
                                orden.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                orden.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {orden.estado}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {orden.tecnicoAsignado || 'Sin asignar'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {orden.montoTotal ? `$${orden.montoTotal.toFixed(2)}` : 'Pendiente'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(orden.fechaIngreso).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {!hasSearched && (
              <div className="text-center py-8 text-gray-500">
                <p>Ingresa un término de búsqueda para encontrar órdenes de trabajo.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}