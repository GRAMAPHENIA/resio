'use client'

import { useState, useEffect } from 'react'

interface NotificationProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
}

export default function Notification({ message, type, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Esperar la animación de fade out
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = {
    success: 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700',
    error: 'bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-700',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-700'
  }

  const textColor = {
    success: 'text-green-800 dark:text-green-200',
    error: 'text-red-800 dark:text-red-200',
    info: 'text-blue-800 dark:text-blue-200'
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 border rounded-lg shadow-lg transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      } ${bgColor[type]} ${textColor[type]}`}
    >
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          className="ml-4 text-lg font-bold hover:opacity-75"
        >
          ×
        </button>
      </div>
    </div>
  )
}

interface NotificationContextType {
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void
}

export function useNotification(): NotificationContextType {
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    // Esta función será implementada en el componente padre
    console.log(`${type}: ${message}`)
  }

  return {
    showNotification
  }
}