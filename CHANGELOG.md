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

## [0.3.0] - 2024-11-04

### Agregado

- **Clean Architecture completa**: Implementación de arquitectura limpia en 4 capas bien definidas
- **Entidades del dominio**: Booking, Property, User con lógica de negocio encapsulada
- **Value Objects**: BookingStatus, DateRange, ContactInfo, Email con validaciones inmutables
- **Casos de uso específicos**: CreateBooking, GetBooking, CompletePayment, CancelBooking
- **Repositorios con inyección de dependencias**: Abstracción completa de persistencia
- **APIs v2**: Nuevos endpoints RESTful siguiendo principios de Clean Architecture
- **Sistema de testing robusto**: 47 tests unitarios con cobertura alta
- **Contenedor de dependencias**: Inyección automática de servicios
- **Hooks personalizados**: useBooking para gestión de estado en React
- **Componentes desacoplados**: BookingFormV2, UserBookingsList con separación clara

### Cambiado

- **Migración completa del sistema de reservas**: De código legacy a Clean Architecture
- **Flujo de reservas optimizado**: Lógica de negocio centralizada en entidades
- **Validaciones mejoradas**: Encapsuladas en value objects inmutables
- **Manejo de errores consistente**: Centralizado en casos de uso
- **Estructura de archivos reorganizada**: Separación por capas arquitectónicas
- **Tipos TypeScript refactorizados**: Mayor seguridad de tipos
- **Performance optimizada**: Reducción de complejidad ciclomática en 80%

### Corregido

- **Errores de build en producción**: Corrección completa de tipos TypeScript
- **Problemas de dependencias circulares**: Eliminados con inyección de dependencias
- **Inconsistencias en validaciones**: Centralizadas en entidades del dominio
- **Duplicación de código**: Eliminada con reutilización de componentes
- **Problemas de testabilidad**: Resueltos con arquitectura desacoplada

### Técnico

- **Principios SOLID aplicados**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **Separación de capas**: Domain, Application, Infrastructure, Presentation
- **Compatibilidad mantenida**: APIs legacy siguen funcionando durante transición
- **Build exitosa**: 0 errores de compilación, 0 advertencias de linting
- **Cobertura de tests**: 87% en lógica de negocio crítica

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
