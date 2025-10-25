'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, Home } from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
  propertyName: string
}

export default function ImageGallery({ images, propertyName }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [showModal, setShowModal] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div className="h-96 bg-neutral-700 flex items-center justify-center">
        <div className="text-center">
          <Home className="w-20 h-20 text-neutral-500 mx-auto mb-4" />
          <span className="text-neutral-400 text-lg">Sin imágenes disponibles</span>
        </div>
      </div>
    )
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length)
  }

  const openModal = (index: number) => {
    setSelectedImage(index)
    setShowModal(true)
  }

  return (
    <>
      {/* Galería principal */}
      <div className="relative">
        {/* Imagen principal */}
        <div className="h-96 relative overflow-hidden cursor-pointer" onClick={() => openModal(selectedImage)}>
          <Image
            src={images[selectedImage]}
            alt={`${propertyName} - Imagen ${selectedImage + 1}`}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
            priority
          />
          
          {/* Navegación sobre la imagen */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
              
              {/* Indicador de imagen actual */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-sm">
                {selectedImage + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {/* Miniaturas */}
        {images.length > 1 && (
          <div className="mt-4 grid grid-cols-4 md:grid-cols-6 gap-2">
            {images.slice(0, 6).map((image, index) => (
              <div
                key={index}
                className={`relative h-20 cursor-pointer overflow-hidden border-2 transition-all ${
                  selectedImage === index ? 'border-foreground' : 'border-neutral-700 hover:border-neutral-500'
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image}
                  alt={`${propertyName} - Miniatura ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, 16vw"
                />
                {index === 5 && images.length > 6 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-semibold">+{images.length - 6}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de imagen completa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Botón cerrar */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-neutral-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Imagen en modal */}
            <div className="relative h-[70vh] w-full">
              <Image
                src={images[selectedImage]}
                alt={`${propertyName} - Imagen ${selectedImage + 1}`}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </div>

            {/* Navegación en modal */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-8 h-8 text-white" />
                </button>
                
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-8 h-8 text-white" />
                </button>

                {/* Contador en modal */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white">
                  {selectedImage + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}