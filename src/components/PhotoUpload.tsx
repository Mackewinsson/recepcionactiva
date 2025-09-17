'use client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface PhotoUploadProps {
  orderNumber: string
  onPhotoUploaded?: (photoUrl: string) => void
  existingPhotos?: string[]
  maxPhotos?: number
}

interface UploadedPhoto {
  id: string
  url: string
  filename: string
  uploadedAt: string
}

export default function PhotoUpload({ 
  orderNumber, 
  onPhotoUploaded, 
  existingPhotos = [], 
  maxPhotos = 10 
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>(existingPhotos.map((url, index) => ({
    id: `existing-${index}`,
    url,
    filename: `photo-${index + 1}.jpg`,
    uploadedAt: new Date().toISOString()
  })))
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                 window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const newFiles = Array.from(files).slice(0, maxPhotos - photos.length)
    if (newFiles.length === 0) {
      alert(`Máximo ${maxPhotos} fotos permitidas`)
      return
    }

    setUploading(true)

    try {
      for (const file of newFiles) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`El archivo ${file.name} no es una imagen válida`)
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`El archivo ${file.name} es demasiado grande (máximo 5MB)`)
          continue
        }

        const formData = new FormData()
        formData.append('photo', file)
        formData.append('orderNumber', orderNumber)

        const response = await fetch('/api/orders/photos/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          const newPhoto: UploadedPhoto = {
            id: result.id,
            url: result.url,
            filename: file.name,
            uploadedAt: new Date().toISOString()
          }
          
          setPhotos(prev => [...prev, newPhoto])
          onPhotoUploaded?.(result.url)
        } else {
          const error = await response.json()
          alert(`Error al subir ${file.name}: ${error.message}`)
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error al subir las fotos')
    } finally {
      setUploading(false)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (isMobile) {
      // On mobile, show confirmation dialog
      if (showDeleteConfirm === photoId) {
        try {
          const response = await fetch(`/api/orders/photos/${photoId}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            setPhotos(prev => prev.filter(photo => photo.id !== photoId))
            setShowDeleteConfirm(null)
          } else {
            alert('Error al eliminar la foto')
          }
        } catch (error) {
          console.error('Delete error:', error)
          alert('Error al eliminar la foto')
        }
      } else {
        setShowDeleteConfirm(photoId)
        // Auto-hide confirmation after 3 seconds
        setTimeout(() => setShowDeleteConfirm(null), 3000)
      }
    } else {
      // Desktop: direct delete
      try {
        const response = await fetch(`/api/orders/photos/${photoId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setPhotos(prev => prev.filter(photo => photo.id !== photoId))
        } else {
          alert('Error al eliminar la foto')
        }
      } catch (error) {
        console.error('Delete error:', error)
        alert('Error al eliminar la foto')
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">📸 Fotos de la Orden</h3>
        <span className="text-sm text-gray-500">
          {photos.length}/{maxPhotos} fotos
        </span>
      </div>

      {/* Mobile-Optimized Upload Area */}
      {photos.length < maxPhotos && (
        <div className="space-y-3">
          {isMobile ? (
            // Mobile upload buttons
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading}
                className="flex flex-col items-center justify-center p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <div className="text-2xl mb-2">📷</div>
                <span className="text-sm font-medium text-blue-700">Tomar Foto</span>
              </button>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex flex-col items-center justify-center p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <div className="text-2xl mb-2">📁</div>
                <span className="text-sm font-medium text-green-700">Galería</span>
              </button>
            </div>
          ) : (
            // Desktop drag & drop area
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="space-y-2">
                <div className="text-4xl">📷</div>
                <div className="text-sm text-gray-600">
                  Arrastra fotos aquí o{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                    disabled={uploading}
                  >
                    selecciona archivos
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  JPG, PNG, GIF hasta 5MB cada una
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Upload Progress */}
      {uploading && (
        <div className="flex items-center justify-center space-x-2 text-blue-600 py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-sm font-medium">Subiendo fotos...</span>
        </div>
      )}

      {/* Mobile-Optimized Photo Grid */}
      {photos.length > 0 && (
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                <Image
                  src={photo.url}
                  alt={photo.filename}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Mobile-optimized Delete Button */}
              <button
                onClick={() => handleDeletePhoto(photo.id)}
                className={`absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 transition-all ${
                  isMobile 
                    ? 'opacity-100 shadow-lg' 
                    : 'opacity-0 group-hover:opacity-100'
                } ${
                  showDeleteConfirm === photo.id 
                    ? 'bg-red-600 scale-110' 
                    : 'hover:bg-red-600'
                }`}
                title="Eliminar foto"
              >
                {showDeleteConfirm === photo.id ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>

              {/* Photo Info - Hidden on mobile to save space */}
              {!isMobile && (
                <div className="mt-1 text-xs text-gray-500 truncate">
                  {photo.filename}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && !uploading && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📷</div>
          <div className="text-sm">No hay fotos subidas para esta orden</div>
          {isMobile && (
            <div className="text-xs mt-1 text-gray-400">
              Toca los botones de arriba para agregar fotos
            </div>
          )}
        </div>
      )}
    </div>
  )
}
