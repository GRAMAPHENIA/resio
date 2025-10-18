/**
 * Componente Footer
 *
 * Footer minimalista que muestra la versión de la aplicación
 * y un mensaje indicando que está en desarrollo alfa.
 *
 * @returns {JSX.Element} Footer con versión y estado alfa
 */
export default function Footer() {
  const version = "0.1.0";

  return (
    <footer className="mt-auto py-4 text-center text-sm text-gray-500 border-t border-gray-200/10">
      <p>
        RESIO v{version} - <span className="text-xl text-orange-500">α</span>
      </p>
    </footer>
  );
}
