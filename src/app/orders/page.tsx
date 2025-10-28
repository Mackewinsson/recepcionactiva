'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import PhotoUpload from '@/components/PhotoUpload'

interface Order {
  numeroOrden: string
  fecha: string
  estado: number
  total: number
  subtotal: number
  observaciones: string | null
  cliente: string | null
  nivelUsuario: number
  matricula: string | null
  nombreVehiculo: string | null
  bastidor: string | null
  motor: string | null
  estadoVehiculo: number | null
  costeVehiculo: number | null
}

interface SearchResult {
  numeroOrden: string
  cliente: string | null
  fecha: string
  estado: number
  total: number
  subtotal: number
  matricula: string | null
  nombreVehiculo: string | null
  bastidor: string | null
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderPhotos, setOrderPhotos] = useState<string[]>([])
  const router = useRouter()
  const orderDetailsRef = useRef<HTMLDivElement>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setLoading(true)
    setError('')
    setSelectedOrder(null)

    try {
      const response = await fetch(`/api/orders/search?q=${encodeURIComponent(searchTerm)}`)
      if (response.ok) {
        const results = await response.json()
        setSearchResults(results)
      } else {
        setError('Error al buscar órdenes')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const loadOrderPhotos = async (orderNumber: string) => {
    try {
      const response = await fetch(`/api/orders/photos?orderNumber=${encodeURIComponent(orderNumber)}`)
      if (response.ok) {
        const photos = await response.json()
        setOrderPhotos(photos.map((photo: { url: string }) => photo.url))
      }
    } catch (err) {
      console.error('Error loading photos:', err)
    }
  }

  const handleSelectOrder = async (orderNumber: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/orders/details?numero=${encodeURIComponent(orderNumber)}`)
      if (response.ok) {
        const orderDetails = await response.json()
        setSelectedOrder(orderDetails)
        // Load photos for the selected order
        await loadOrderPhotos(orderNumber)
        
        // Scroll to order details panel after a short delay to ensure it's rendered
        setTimeout(() => {
          if (orderDetailsRef.current) {
            // Add a temporary highlight effect
            orderDetailsRef.current.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50')
            
            orderDetailsRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            })
            
            // Remove highlight after animation completes
            setTimeout(() => {
              orderDetailsRef.current?.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50')
            }, 2000)
          }
        }, 100)
      } else {
        setError('Error al cargar detalles de la orden')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const getEstadoText = (estado: number) => {
    switch (estado) {
      case 1: return 'Pendiente'
      case 2: return 'En Proceso'
      case 3: return 'Completada'
      default: return 'Desconocido'
    }
  }

  const getEstadoColor = (estado: number) => {
    switch (estado) {
      case 1: return 'bg-yellow-100 text-yellow-800'
      case 2: return 'bg-blue-100 text-blue-800'
      case 3: return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Vehículos</h1>
          <p className="text-sm sm:text-base text-gray-600">Busca vehículos por matrícula o número de orden</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 lg:items-start">
          {/* Search Panel */}
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 lg:sticky lg:top-6">
            <h2 className="text-base sm:text-lg font-semibold mb-4 text-black">🚗 Vehículos</h2>
            
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ej: 2500CCC, 5422CCC, 12345..."
                  className="flex-1 px-3 py-2 sm:py-2 border-2 border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900 placeholder-gray-600"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-blue-600 px-4 py-2.5 text-base font-medium text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
            </form>

            {error && (
              <div className="text-red-600 text-sm mb-4">{error}</div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700 text-sm sm:text-base">Órdenes encontradas ({searchResults.length})</h3>
                <div className="max-h-[60vh] sm:max-h-[70vh] space-y-2 overflow-y-auto pr-1">
                  {searchResults.map((order) => {
                    const isSelected = selectedOrder?.numeroOrden === order.numeroOrden
                    return (
                      <button
                        key={order.numeroOrden}
                        type="button"
                        onClick={() => handleSelectOrder(order.numeroOrden)}
                        aria-pressed={isSelected}
                        className={`w-full rounded-lg border px-3 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/60 active:bg-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                          isSelected ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-gray-900 sm:text-base">
                              {order.numeroOrden}
                            </div>
                            <div className="truncate text-xs text-gray-600 sm:text-sm">
                              {order.cliente || 'Sin cliente'}
                            </div>
                            <div className="text-xs font-medium text-blue-600 sm:text-sm">
                              🚗 {order.matricula || 'Sin matrícula'}
                            </div>
                            {order.nombreVehiculo && (
                              <div className="truncate text-xs text-gray-500">{order.nombreVehiculo}</div>
                            )}
                            <div className="text-xs text-gray-500">
                              {new Date(order.fecha).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <span
                              className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium ${getEstadoColor(order.estado)}`}
                            >
                              {getEstadoText(order.estado)}
                            </span>
                            <div className="mt-1 text-xs font-medium text-gray-900 sm:text-sm">
                              {order.total ? order.total.toFixed(2) + '€' : '0.00€'}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {searchResults.length === 0 && searchTerm && !loading && (
              <div className="text-gray-500 text-center py-8">
                No se encontraron órdenes
              </div>
            )}
          </div>

          {/* Order Details Panel */}
          <div ref={orderDetailsRef} className="bg-white rounded-lg border p-4 sm:p-6 shadow-sm transition-all duration-300 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-semibold mb-4">📋 Detalles de la Orden</h2>
            
            {selectedOrder ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-gray-100 px-3 py-2">
                  <span className="text-xs font-medium text-gray-600 sm:text-sm">
                    Orden seleccionada
                  </span>
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold text-white">
                    #{selectedOrder.numeroOrden}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Número de Orden</label>
                    <div className="text-base sm:text-lg font-bold text-gray-900">{selectedOrder.numeroOrden}</div>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Estado</label>
                    <div>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getEstadoColor(selectedOrder.estado)}`}>
                        {getEstadoText(selectedOrder.estado)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Cliente</label>
                  <div className="text-sm sm:text-base text-gray-900">{selectedOrder.cliente || 'Sin cliente'}</div>
                </div>

                {/* Vehicle Information */}
                <div className="bg-blue-50 p-3 sm:p-4 rounded-md">
                  <h3 className="text-xs sm:text-sm font-medium text-blue-900 mb-2">🚗 Información del Vehículo</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="text-xs font-medium text-blue-700">Matrícula</label>
                      <div className="text-sm font-bold text-blue-900">{selectedOrder.matricula || 'Sin matrícula'}</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-blue-700">Vehículo</label>
                      <div className="text-sm text-blue-900 truncate">{selectedOrder.nombreVehiculo || 'Sin información'}</div>
                    </div>
                  </div>
                  {selectedOrder.bastidor && (
                    <div className="mt-2">
                      <label className="text-xs font-medium text-blue-700">Bastidor</label>
                      <div className="text-xs sm:text-sm text-blue-900 break-all">{selectedOrder.bastidor}</div>
                    </div>
                  )}
                  {selectedOrder.motor && (
                    <div className="mt-2">
                      <label className="text-xs font-medium text-blue-700">Motor</label>
                      <div className="text-xs sm:text-sm text-blue-900 break-all">{selectedOrder.motor}</div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Fecha</label>
                  <div className="text-xs sm:text-sm text-gray-900">
                    {new Date(selectedOrder.fecha).toLocaleDateString('es-ES')} {' '}
                    {new Date(selectedOrder.fecha).toLocaleTimeString('es-ES')}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Subtotal</label>
                    <div className="text-base sm:text-lg font-semibold text-gray-900">
                      {selectedOrder.subtotal ? selectedOrder.subtotal.toFixed(2) + '€' : '0.00€'}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Total</label>
                    <div className="text-base sm:text-lg font-bold text-blue-600">
                      {selectedOrder.total ? selectedOrder.total.toFixed(2) + '€' : '0.00€'}
                    </div>
                  </div>
                </div>

                {selectedOrder.observaciones && (
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Observaciones</label>
                    <div className="text-xs sm:text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {selectedOrder.observaciones}
                    </div>
                  </div>
                )}

                {/* Photo Upload Section */}
                <div className="border-t pt-4">
                  <PhotoUpload
                    orderNumber={selectedOrder.numeroOrden}
                    existingPhotos={orderPhotos}
                    onPhotoUploaded={(photoUrl) => {
                      setOrderPhotos(prev => [...prev, photoUrl])
                    }}
                    maxPhotos={10}
                  />
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-12">
                <div className="text-4xl mb-4">📋</div>
                <div>Selecciona una orden para ver los detalles</div>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-4 sm:mt-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto rounded-md bg-gray-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 active:bg-gray-800 sm:text-base"
          >
            ← Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  )
}
