'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { MockInvoiceService, Invoice } from '@/lib/mock-data'

export default function VerFacturaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadInvoice()
  }, [isAuthenticated, router, params.id])

  const loadInvoice = async () => {
    try {
      const invoiceData = await MockInvoiceService.getInvoice(parseInt(params.id))
      if (invoiceData) {
        setInvoice(invoiceData)
      } else {
        setError('Error al cargar la factura')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'SENT': return 'bg-blue-100 text-blue-800'
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'OVERDUE': return 'bg-red-100 text-red-800'
      case 'CANCELLED': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Borrador'
      case 'SENT': return 'Enviada'
      case 'PAID': return 'Pagada'
      case 'OVERDUE': return 'Vencida'
      case 'CANCELLED': return 'Cancelada'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleEdit = () => {
    router.push(`/facturacion/editar/${params.id}`)
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando factura...</div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error || 'Factura no encontrada'}</div>
          <button
            onClick={() => router.push('/facturacion')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Volver a Facturación
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Actions */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => router.push('/facturacion')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Volver a Facturación
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Editar
            </button>
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Imprimir
            </button>
          </div>
        </div>

        {/* Invoice */}
        <div className="bg-white rounded-lg shadow-sm border p-8 print:shadow-none print:border-0">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                FACTURA {invoice.tipoFactura?.toUpperCase()}
              </h1>
              <p className="text-lg text-gray-600">
                #{invoice.serie ? `${invoice.serie}-${invoice.numero}` : invoice.numero}
              </p>
              {invoice.esRectificativa && (
                <p className="text-sm text-red-600 font-medium">FACTURA RECTIFICATIVA</p>
              )}
            </div>
            <div className="text-right">
              <div className="mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                  {getStatusText(invoice.status)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p>Fecha de expedición: {formatDate(invoice.fechaExpedicion)}</p>
                {invoice.fechaOperacion && invoice.fechaOperacion !== invoice.fechaExpedicion && (
                  <p>Fecha de operación: {formatDate(invoice.fechaOperacion)}</p>
                )}
                {invoice.fechaVencimiento && (
                  <p>Fecha de vencimiento: {formatDate(invoice.fechaVencimiento)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Facturar a:</h3>
              <div className="text-gray-700">
                <p className="font-semibold">{invoice.cliente.nombreORazonSocial}</p>
                {invoice.cliente.NIF && <p>NIF: {invoice.cliente.NIF}</p>}
                {invoice.cliente.domicilio && (
                  <div className="mt-2">
                    <p>{invoice.cliente.domicilio.calle}</p>
                    <p>{invoice.cliente.domicilio.codigoPostal} {invoice.cliente.domicilio.municipio}</p>
                    <p>{invoice.cliente.domicilio.provincia}, {invoice.cliente.domicilio.pais}</p>
                  </div>
                )}
                <p className="mt-2">País: {invoice.cliente.pais}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Emisor:</h3>
              <div className="text-gray-700">
                <p className="font-semibold">{invoice.emisor.nombreORazonSocial}</p>
                <p>NIF: {invoice.emisor.NIF}</p>
                <div className="mt-2">
                  <p>{invoice.emisor.domicilio.calle}</p>
                  <p>{invoice.emisor.domicilio.codigoPostal} {invoice.emisor.domicilio.municipio}</p>
                  <p>{invoice.emisor.domicilio.provincia}, {invoice.emisor.domicilio.pais}</p>
                </div>
                {invoice.emisor.iban && <p className="mt-2">IBAN: {invoice.emisor.iban}</p>}
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Descripción
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-900">
                    Cantidad
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    Precio Unitario
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-900">
                    IVA
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineas.map((linea, index) => (
                  <tr key={linea.id || index}>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                      {linea.descripcion}
                      {linea.exenta && (
                        <div className="text-xs text-blue-600 mt-1">Exenta</div>
                      )}
                      {linea.inversionSujetoPasivo && (
                        <div className="text-xs text-green-600 mt-1">ISP</div>
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-900">
                      {linea.cantidad}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right text-sm text-gray-900">
                      {formatCurrency(linea.precioUnitario)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-900">
                      {linea.exenta ? 'Exenta' : 
                       linea.inversionSujetoPasivo ? 'ISP' : 
                       `${linea.tipoIVA}%`}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right text-sm text-gray-900">
                      {formatCurrency(linea.totalLinea)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="space-y-2">
                {invoice.totales.basesPorTipo.map((base, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">Base {base.tipoIVA}%:</span>
                    <span className="text-gray-900">{formatCurrency(base.base)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Imponible Total:</span>
                  <span className="text-gray-900">{formatCurrency(invoice.totales.baseImponibleTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cuota IVA Total:</span>
                  <span className="text-gray-900">{formatCurrency(invoice.totales.cuotaIVATotal)}</span>
                </div>
                {invoice.totales.cuotaRETotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cuota RE Total:</span>
                    <span className="text-gray-900">{formatCurrency(invoice.totales.cuotaRETotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                  <span className="text-gray-900">Total Factura:</span>
                  <span className="text-gray-900">{formatCurrency(invoice.totales.totalFactura)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notas && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas:</h3>
              <div className="text-gray-700 bg-gray-50 p-4 rounded-md">
                {invoice.notas.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-300 pt-8">
            <p>Gracias por su negocio</p>
            <p className="mt-2">
              Factura creada el {formatDate(invoice.createdAt)} | 
              Última actualización: {formatDate(invoice.updatedAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

