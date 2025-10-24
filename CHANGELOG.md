# Registro de Cambios

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto se adhiere al [Versionado Semántico](https://semver.org/spec/v2.0.0.html).

## [Sin liberar]

### Agregado

### Cambiado

### Obsoleto

### Removido

### Corregido

### Seguridad

## [0.2.0] - 2025-10-24

### Agregado

- Sistema completo de reservas y pagos
- Integración con MercadoPago para procesamiento de pagos
- Formulario de reserva con selección de fechas y cálculo automático de precios
- Verificación de disponibilidad de propiedades
- Páginas de resultado de pago (éxito, fallo, pendiente)
- Dashboard de reservas para usuarios
- API endpoints para crear preferencias de MercadoPago
- Webhook para recibir notificaciones de pago
- Página para explorar propiedades disponibles
- Página de detalle de propiedad con formulario de reserva
- Servicio de reservas con gestión de estados
- Navegación actualizada con acceso a explorar propiedades y reservas
- Documentación de configuración de MercadoPago (MERCADOPAGO-CONFIG.md)

### Cambiado

- Actualizada la navegación principal con nuevas rutas
- Mejorada la estructura de la base de datos con tabla de reservas
- Actualizado README.md con instrucciones de configuración de MercadoPago

## [0.1.0] - 2025-10-18

### Agregado

- Lanzamiento inicial de RESIO
- Flujo básico de autenticación
- Documentación del proyecto (README.md)

---

## Guía para mantener el REGISTRO DE CAMBIOS

### Tipos de cambios

- **Agregado**: Nuevas funcionalidades
- **Cambiado**: Cambios en funcionalidades existentes
- **Obsoleto**: Funcionalidades obsoletas
- **Removido**: Funcionalidades eliminadas
- **Corregido**: Corrección de errores
- **Seguridad**: Cambios relacionados con seguridad

### Proceso para actualizar

1. Antes de hacer commit de cambios, actualiza la sección [Sin liberar] con los cambios realizados
2. Al hacer una nueva versión, mueve los cambios de [Sin liberar] a una nueva sección con la versión y fecha
3. Actualiza el package.json con la nueva versión si es necesario
4. Haz commit del CHANGELOG.md junto con los cambios del código

### Ejemplo de entrada

```
### Agregado
- Nueva funcionalidad de búsqueda de alojamientos
- Validación de formularios en el frontend

### Corregido
- Corrección del error en el callback de autenticación
```
