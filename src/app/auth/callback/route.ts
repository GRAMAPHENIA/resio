import { NextResponse } from "next/server";

/**
 * Ruta de callback para autenticación OAuth
 *
 * Esta ruta maneja el callback después de que el usuario complete el proceso
 * de autenticación con un proveedor OAuth (como Google). Actualmente, simplemente
 * redirige al usuario a la página principal.
 *
 * En el futuro, podría incluir lógica adicional como:
 * - Verificar el estado de la autenticación
 * - Manejar errores de autenticación
 * - Establecer cookies de sesión
 * - Redirigir a una página específica basada en el contexto
 *
 * @returns {NextResponse} Redirección a la página principal
 */
export async function GET() {
  return NextResponse.redirect("/");
}
