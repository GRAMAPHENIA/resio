export const ROUTES = {
  // Públicas
  HOME: '/',
  REGISTER: '/registro',
  LOGIN: '/ingresar',
  
  // Autenticación
  WELCOME: '/bienvenida',
  AUTH_CALLBACK: '/auth/callback',
  
  // Dashboard
  DASHBOARD: '/tablero',
  
  // Propiedades
  PROPERTIES: '/propiedades',
  PROPERTIES_ADD: '/propiedades/agregar',
  
  // API
  API: {
    AUTH: '/api/auth',
    PROPERTIES: '/api/properties'
  }
} as const

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.REGISTER,
  ROUTES.LOGIN
] as const

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.PROPERTIES,
  ROUTES.PROPERTIES_ADD,
  ROUTES.WELCOME
] as const