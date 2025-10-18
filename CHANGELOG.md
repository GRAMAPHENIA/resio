# Registro de Cambios

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto se adhiere al [Versionado Semántico](https://semver.org/spec/v2.0.0.html).

## [Sin liberar]

### Agregado

- Configuración inicial de la aplicación RESIO
- Autenticación con Google usando Supabase
- Interfaz básica con botón de login y página principal
- Estructura del proyecto con Next.js, React y TypeScript
- Tailwind CSS para estilos
- CHANGELOG.md para seguimiento de cambios
- Documentación de componentes principales (LoginButton, ruta auth/callback)
- Componente Footer minimalista con número de versión y estado alfa
- Mejora del layout de la página principal con footer

### Cambiado

### Obsoleto

### Removido

### Corregido

### Seguridad

## [0.1.0] - 2025-10-18

### Agregado

- Lanzamiento inicial de RESIO
- Flujo básico de autenticación
- Documentación del proyecto (README.md)

---

## Guía para mantener el REGISTRO DE CAMBIOS

### Tipos de cambios:

- **Agregado**: Nuevas funcionalidades
- **Cambiado**: Cambios en funcionalidades existentes
- **Obsoleto**: Funcionalidades obsoletas
- **Removido**: Funcionalidades eliminadas
- **Corregido**: Corrección de errores
- **Seguridad**: Cambios relacionados con seguridad

### Proceso para actualizar:

1. Antes de hacer commit de cambios, actualiza la sección [Sin liberar] con los cambios realizados
2. Al hacer una nueva versión, mueve los cambios de [Sin liberar] a una nueva sección con la versión y fecha
3. Actualiza el package.json con la nueva versión si es necesario
4. Haz commit del CHANGELOG.md junto con los cambios del código

### Ejemplo de entrada:

```
### Agregado
- Nueva funcionalidad de búsqueda de alojamientos
- Validación de formularios en el frontend

### Corregido
- Corrección del error en el callback de autenticación
```
