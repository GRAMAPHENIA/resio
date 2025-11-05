# Clean Architecture Implementation

## Arquitectura Implementada

Este proyecto ahora sigue los principios de Clean Architecture y SOLID, organizando el código en capas bien definidas con responsabilidades claras.

### Estructura de Capas

```
src/
├── domain/                    # Capa de Dominio (Reglas de Negocio)
│   ├── entities/             # Entidades del dominio
│   │   ├── Property.ts       # Entidad Propiedad
│   │   ├── Booking.ts        # Entidad Reserva
│   │   └── User.ts           # Entidad Usuario
│   ├── value-objects/        # Objetos de Valor
│   │   ├── BookingStatus.ts  # Estado de reserva
│   │   ├── DateRange.ts      # Rango de fechas
│   │   ├── ContactInfo.ts    # Información de contacto
│   │   └── Email.ts          # Email validado
│   ├── repositories/         # Interfaces de repositorios
│   │   ├── BookingRepository.ts
│   │   ├── PropertyRepository.ts
│   │   └── UserRepository.ts
│   └── services/            # Servicios de dominio
│       ├── AvailabilityService.ts
│       └── BookingDomainService.ts
├── application/             # Capa de Aplicación (Casos de Uso)
│   ├── booking/            # Casos de uso de reservas
│   │   ├── CreateBookingUseCase.ts
│   │   ├── GetBookingUseCase.ts
│   │   ├── GetUserBookingsUseCase.ts
│   │   ├── CompletePaymentUseCase.ts
│   │   └── CancelBookingUseCase.ts
│   └── services/           # Servicios de aplicación
│       └── BookingService.ts
├── infrastructure/         # Capa de Infraestructura
│   ├── repositories/      # Implementaciones de repositorios
│   │   ├── SupabaseBookingRepository.ts
│   │   └── SupabasePropertyRepository.ts
│   └── container/         # Contenedor de dependencias
│       └── Container.ts
└── presentation/          # Capa de Presentación
    ├── components/       # Componentes React
    │   └── booking/
    │       └── BookingFormV2.tsx
    └── hooks/           # Hooks personalizados
        └── useBooking.ts
```

## Principios SOLID Aplicados

### 1. Single Responsibility Principle (SRP)
- **Entidades**: Cada entidad tiene una sola responsabilidad (Property, Booking, User)
- **Value Objects**: Encapsulan validación y comportamiento específico (Email, DateRange)
- **Use Cases**: Cada caso de uso maneja una sola operación de negocio
- **Repositorios**: Solo se encargan de persistencia de datos

### 2. Open/Closed Principle (OCP)
- **Interfaces de repositorios**: Permiten agregar nuevas implementaciones sin modificar código existente
- **Servicios de dominio**: Extensibles mediante composición
- **Use Cases**: Nuevos casos de uso se pueden agregar sin modificar existentes

### 3. Liskov Substitution Principle (LSP)
- **Implementaciones de repositorios**: Cualquier implementación puede sustituir a la interfaz
- **Servicios**: Las implementaciones concretas respetan los contratos de las interfaces

### 4. Interface Segregation Principle (ISP)
- **Repositorios específicos**: Interfaces pequeñas y específicas por entidad
- **Use Cases**: Interfaces mínimas y enfocadas

### 5. Dependency Inversion Principle (DIP)
- **Inyección de dependencias**: Los casos de uso dependen de abstracciones, no de implementaciones concretas
- **Container**: Maneja la creación e inyección de dependencias

## Beneficios de la Nueva Arquitectura

### 1. **Testabilidad**
```typescript
// Fácil de testear con mocks
const mockBookingRepository = {
  findById: jest.fn(),
  save: jest.fn(),
  // ...
}

const useCase = new CreateBookingUseCase(
  mockBookingRepository,
  mockPropertyRepository,
  mockAvailabilityService
)
```

### 2. **Mantenibilidad**
- Código organizado por responsabilidades
- Cambios en una capa no afectan otras
- Fácil localización de bugs

### 3. **Extensibilidad**
- Nuevas funcionalidades se agregan sin modificar código existente
- Fácil cambio de proveedores (Supabase → PostgreSQL directo)
- Nuevos casos de uso sin impacto

### 4. **Reutilización**
- Entidades y value objects reutilizables
- Servicios de dominio compartidos
- Use cases componibles

## Flujo de Datos

### Creación de Reserva
```
1. UI Component (BookingFormV2)
   ↓
2. API Route (/api/v2/bookings)
   ↓
3. Container.getBookingService()
   ↓
4. CreateBookingUseCase.execute()
   ↓
5. AvailabilityService.isPropertyAvailable()
   ↓
6. BookingDomainService.createBooking()
   ↓
7. BookingRepository.save()
   ↓
8. SupabaseBookingRepository (implementación)
```

## Comparación: Antes vs Después

### Antes (Código Legacy)
```typescript
// Lógica mezclada en servicios
export class BookingService {
  static async createBooking(data) {
    // Validación mezclada con lógica de negocio
    // Acceso directo a Supabase
    // Manejo de errores inconsistente
    // Difícil de testear
  }
}
```

### Después (Clean Architecture)
```typescript
// Separación clara de responsabilidades
export class CreateBookingUseCase {
  constructor(
    private bookingRepository: BookingRepository,
    private propertyRepository: PropertyRepository,
    private availabilityService: AvailabilityService
  ) {}

  async execute(request: CreateBookingRequest): Promise<CreateBookingResponse> {
    // Lógica clara y testeable
    // Dependencias inyectadas
    // Validación en entidades
  }
}
```

## Migración Gradual

### Fase 1: ✅ Completada
- Entidades y Value Objects
- Interfaces de repositorios
- Casos de uso principales
- Nueva API v2

### Fase 2: En Progreso
- Migrar componentes existentes
- Actualizar hooks
- Deprecar APIs v1

### Fase 3: Futura
- Agregar tests unitarios
- Implementar más casos de uso
- Optimizaciones de performance

## Uso de la Nueva Arquitectura

### En Componentes React
```typescript
import { useBooking } from '@/presentation/hooks/useBooking'

function MyComponent() {
  const { getUserBookings, loading, error } = useBooking()
  
  // Uso simple y limpio
  const bookings = await getUserBookings({ email: 'user@example.com' })
}
```

### En APIs
```typescript
import { Container } from '@/infrastructure/container/Container'

export async function POST(request: NextRequest) {
  const container = Container.getInstance()
  const bookingService = container.getBookingService()
  
  const result = await bookingService.createBooking(request)
  return NextResponse.json(result)
}
```

## Próximos Pasos

1. **Migrar componentes existentes** a usar la nueva arquitectura
2. **Agregar tests unitarios** para casos de uso
3. **Implementar más value objects** (Money, Address, etc.)
4. **Crear más servicios de dominio** según necesidades
5. **Optimizar performance** con caching y lazy loading

---

Esta arquitectura garantiza un código más limpio, mantenible y escalable, siguiendo las mejores prácticas de desarrollo de software.