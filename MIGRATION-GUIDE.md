# Guía de Migración - Clean Architecture

## Resumen de Cambios

Este proyecto ha sido refactorizado para implementar Clean Architecture y principios SOLID. Esta guía te ayudará a entender los cambios y cómo migrar del código legacy al nuevo.

## Arquitectura Anterior vs Nueva

### Antes (Legacy)
```
src/
├── services/
│   ├── booking.service.ts     # Lógica mezclada
│   └── mercadopago.service.ts # Acceso directo a APIs
├── components/
│   └── booking/
│       ├── BookingForm.tsx    # Lógica de negocio en UI
│       └── booking-form.tsx   # Duplicado
└── app/api/
    └── create-preference/     # Lógica compleja en API routes
```

### Después (Clean Architecture)
```
src/
├── domain/                    # Reglas de negocio puras
│   ├── entities/
│   ├── value-objects/
│   ├── repositories/
│   └── services/
├── application/               # Casos de uso
│   └── booking/
├── infrastructure/            # Implementaciones concretas
│   ├── repositories/
│   └── container/
├── presentation/              # UI desacoplada
│   ├── components/
│   └── hooks/
└── app/api/v2/               # APIs limpias
```

## Cambios Principales

### 1. Entidades del Dominio

**Antes:**
```typescript
// Tipos simples sin validación
interface Booking {
  id: string
  property_id: string
  user_email: string
  // ...
}
```

**Después:**
```typescript
// Entidades con lógica de negocio
export class Booking {
  constructor(/* ... */) {
    this.validateBooking()
  }
  
  public canBeCancelled(): boolean { /* ... */ }
  public markAsPaid(paymentId: string): Booking { /* ... */ }
}
```

### 2. Value Objects

**Antes:**
```typescript
// Validación dispersa
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error('Invalid email')
}
```

**Después:**
```typescript
// Validación encapsulada
const email = Email.create('user@example.com') // Valida automáticamente
const dateRange = DateRange.fromStrings('2024-12-01', '2024-12-05')
```

### 3. Casos de Uso

**Antes:**
```typescript
// Lógica mezclada en servicios
export class BookingService {
  static async createBooking(data) {
    // Validación + lógica de negocio + persistencia todo junto
  }
}
```

**Después:**
```typescript
// Casos de uso específicos
export class CreateBookingUseCase {
  async execute(request: CreateBookingRequest): Promise<CreateBookingResponse> {
    // Solo lógica de orquestación
  }
}
```

### 4. APIs Simplificadas

**Antes:**
```typescript
// API compleja con lógica de negocio
export async function POST(request: NextRequest) {
  // 100+ líneas de validación, lógica de negocio, etc.
}
```

**Después:**
```typescript
// API simple que delega a casos de uso
export async function POST(request: NextRequest) {
  const container = Container.getInstance()
  const bookingService = container.getBookingService()
  return await bookingService.createBooking(request)
}
```

## Cómo Migrar

### Paso 1: Usar Nuevos Componentes

**Reemplazar:**
```typescript
import BookingForm from '@/components/booking/BookingForm'
```

**Por:**
```typescript
import BookingFormV2 from '@/presentation/components/booking/BookingFormV2'
```

### Paso 2: Usar Nueva API

**Reemplazar:**
```typescript
fetch('/api/create-preference', { /* ... */ })
```

**Por:**
```typescript
fetch('/api/v2/bookings', { /* ... */ })
```

### Paso 3: Usar Nuevos Hooks

**Reemplazar:**
```typescript
const { getUserBookings } = useBookingService() // Legacy
```

**Por:**
```typescript
const { getUserBookings } = useBooking() // Clean Architecture
```

## Compatibilidad

### APIs Legacy Mantenidas

Las siguientes APIs legacy se mantienen para compatibilidad:
- `/api/create-preference` ✅ Funcional
- `/api/mercadopago/create-preference` ✅ Funcional
- `/api/mercadopago/webhook` ✅ Funcional

### Componentes Legacy

Los componentes legacy se mantienen pero están marcados como deprecated:
- `BookingForm.tsx` ⚠️ Deprecated
- `booking-form.tsx` ⚠️ Deprecated

## Beneficios de la Migración

### 1. Testabilidad
```typescript
// Antes: Difícil de testear
const result = await BookingService.createBooking(data)

// Después: Fácil de testear con mocks
const mockRepo = { save: jest.fn() }
const useCase = new CreateBookingUseCase(mockRepo, ...)
```

### 2. Mantenibilidad
- Código organizado por responsabilidades
- Cambios localizados
- Fácil localización de bugs

### 3. Extensibilidad
- Nuevos casos de uso sin modificar existentes
- Fácil cambio de proveedores (Supabase → PostgreSQL)
- Nuevas funcionalidades sin impacto

### 4. Reutilización
- Entidades reutilizables
- Servicios de dominio compartidos
- Casos de uso componibles

## Ejemplos de Migración

### Crear una Reserva

**Antes:**
```typescript
const response = await fetch('/api/create-preference', {
  method: 'POST',
  body: JSON.stringify({
    property_id: 'prop-123',
    user_name: 'John Doe',
    user_email: 'john@example.com',
    // ...
  })
})
```

**Después:**
```typescript
const response = await fetch('/api/v2/bookings', {
  method: 'POST',
  body: JSON.stringify({
    property_id: 'prop-123',
    contactInfo: {
      name: 'John Doe',
      email: 'john@example.com'
    },
    dateRange: {
      startDate: '2024-12-01',
      endDate: '2024-12-05'
    }
  })
})
```

### Obtener Reservas del Usuario

**Antes:**
```typescript
const bookings = await BookingService.getBookingsByEmail(email)
```

**Después:**
```typescript
const { getUserBookings } = useBooking()
const bookings = await getUserBookings({ email })
```

### Componente de Reserva

**Antes:**
```typescript
<BookingForm 
  property={property}
  onSuccess={(preferenceId) => {
    window.location.href = mercadoPagoUrl
  }}
/>
```

**Después:**
```typescript
<BookingFormV2 
  property={property}
  onSuccess={(bookingId) => {
    router.push(`/reservas/exito?booking_id=${bookingId}`)
  }}
/>
```

## Testing

### Ejecutar Tests
```bash
# Tests unitarios
npm run test

# Tests en modo watch
npm run test:watch

# Coverage report
npm run test:coverage
```

### Escribir Tests
```typescript
// Test de entidad
describe('Booking Entity', () => {
  it('should calculate nights correctly', () => {
    const booking = createValidBooking()
    expect(booking.getNights()).toBe(4)
  })
})

// Test de caso de uso
describe('CreateBookingUseCase', () => {
  it('should create booking successfully', async () => {
    const result = await useCase.execute(validRequest)
    expect(result.booking).toBeDefined()
  })
})
```

## Roadmap de Deprecación

### Fase 1: ✅ Completada (Actual)
- Nueva arquitectura implementada
- APIs v2 funcionales
- Componentes nuevos disponibles
- Tests unitarios básicos

### Fase 2: 📅 Próximos 30 días
- Migrar todas las páginas a nuevos componentes
- Agregar más tests unitarios
- Documentar casos de uso adicionales

### Fase 3: 📅 Próximos 60 días
- Deprecar APIs v1
- Remover componentes legacy
- Optimizaciones de performance

### Fase 4: 📅 Próximos 90 días
- Tests de integración completos
- Monitoreo y métricas
- Documentación final

## Soporte

Si tienes problemas durante la migración:

1. **Revisa la documentación**: `CLEAN-ARCHITECTURE.md`
2. **Ejecuta los tests**: `npm run test`
3. **Consulta ejemplos**: Mira los archivos en `/presentation/components/`
4. **Usa APIs legacy**: Mientras migras, las APIs v1 siguen funcionando

## Checklist de Migración

- [ ] Instalar dependencias de testing: `npm install`
- [ ] Ejecutar tests: `npm run test`
- [ ] Migrar componente por componente
- [ ] Actualizar imports a nuevas rutas
- [ ] Probar funcionalidad completa
- [ ] Remover imports legacy cuando sea seguro

---

Esta migración garantiza un código más limpio, mantenible y escalable siguiendo las mejores prácticas de desarrollo de software.