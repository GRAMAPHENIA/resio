'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-foreground">
            RESIO
          </Link>
          <nav className="flex space-x-4">
            <Link
              href="/login"
              className="text-neutral-300 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="bg-neutral-700 text-foreground hover:bg-neutral-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Registrarse
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}