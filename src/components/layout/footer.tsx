import packageJson from '../../../package.json'

export default function Footer() {
  return (
    <footer className="bg-neutral-900 border-t border-neutral-800 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-neutral-400 text-sm">
              © 2024 RE/SIO. Todos los derechos reservados.
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <span>Versión {packageJson.version}</span>
            <a 
              href="/ayuda" 
              className="hover:text-neutral-300 transition-colors"
            >
              Ayuda
            </a>
            <a 
              href="mailto:soporte@resio.com" 
              className="hover:text-neutral-300 transition-colors"
            >
              Contacto
            </a>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-neutral-800">
          <p className="text-xs text-neutral-600 text-center">
            Plataforma de alquiler de propiedades construida con Clean Architecture
          </p>
        </div>
      </div>
    </footer>
  )
}