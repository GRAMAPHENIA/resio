# Configuración de MercadoPago

## Obtener Credenciales

1. Ve a [MercadoPago Developers](https://www.mercadopago.com.ar/developers/)
2. Inicia sesión con tu cuenta de MercadoPago
3. Ve a "Tus integraciones" > "Crear aplicación"
4. Completa los datos de tu aplicación
5. Una vez creada, ve a "Credenciales"

## Variables de Entorno

Agrega estas variables a tu archivo `.env.local`:

```env
# MercadoPago - Testing
MP_ACCESS_TOKEN=TEST-1234567890-abcdef-your-access-token
NEXT_PUBLIC_MP_PUBLIC_KEY=TEST-your-public-key

# Para producción, cambia TEST por PROD
# MP_ACCESS_TOKEN=PROD-1234567890-abcdef-your-access-token
# NEXT_PUBLIC_MP_PUBLIC_KEY=PROD-your-public-key
```

## Configurar Webhooks (Opcional)

Para recibir notificaciones automáticas de pagos:

1. En tu aplicación de MercadoPago, ve a "Webhooks"
2. Agrega la URL: `https://tu-dominio.com/api/mercadopago/webhook`
3. Selecciona los eventos: `payment`

## URLs de Retorno

Las URLs de retorno ya están configuradas en el código:

- Éxito: `/reservas/exito`
- Fallo: `/reservas/fallo`
- Pendiente: `/reservas/pendiente`

## Testing

Para probar los pagos, usa las [tarjetas de prueba de MercadoPago](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards):

### Tarjetas Aprobadas

- **Visa**: 4509 9535 6623 3704
- **Mastercard**: 5031 7557 3453 0604

### Datos de Prueba

- **CVV**: Cualquier número de 3 dígitos
- **Fecha**: Cualquier fecha futura
- **Nombre**: Cualquier nombre

## Funcionalidades Implementadas

✅ Crear preferencias de pago
✅ Procesar pagos con MercadoPago
✅ Páginas de resultado (éxito, fallo, pendiente)
✅ Gestión de reservas
✅ Verificación de disponibilidad
✅ Webhook para notificaciones completo
✅ Verificación de pagos en tiempo real
✅ Calendario de reservas integrado
✅ Dashboard con estadísticas
✅ API de estado de pagos
✅ Actualización automática de reservas

## APIs Disponibles

### Crear Preferencia de Pago
```
POST /api/mercadopago/create-preference
```

### Webhook de Notificaciones
```
POST /api/mercadopago/webhook
GET /api/mercadopago/webhook
```

### Verificar Estado de Pago
```
GET /api/payment-status?payment_id=123
POST /api/payment-status
```

### Calendario de Reservas
```
GET /api/calendar?type=events&property_id=123
GET /api/calendar?type=availability&property_id=123&year=2024&month=12
GET /api/calendar?type=stats&property_id=123
```

## Componentes Disponibles

### BookingCalendar
Componente de calendario para mostrar reservas con estadísticas integradas.

```tsx
import BookingCalendar from '@/components/calendar/BookingCalendar'

<BookingCalendar 
  propertyId="123" // Opcional, sin esto muestra todas las propiedades
  onEventClick={(event) => console.log(event)}
/>
```

## Servicios

### MercadoPagoService
- `createPreference()` - Crear preferencia de pago
- `getPayment()` - Obtener detalles de un pago
- `verifyPayment()` - Verificar pago con validaciones

### BookingService
- `createBooking()` - Crear nueva reserva
- `updateBookingPayment()` - Actualizar estado de pago
- `getBookingsByUser()` - Obtener reservas de un usuario
- `checkAvailability()` - Verificar disponibilidad

### CalendarService
- `getPropertyCalendar()` - Obtener eventos de una propiedad
- `getAllBookingsCalendar()` - Obtener todos los eventos
- `checkAvailability()` - Verificar disponibilidad
- `getMonthAvailability()` - Disponibilidad mensual
- `getOccupancyStats()` - Estadísticas de ocupación

## Gestión de Disponibilidad

### ✅ Problema Resuelto: Reservas sin pagar bloqueaban disponibilidad

**Antes:**
- Las reservas `pending` (sin pagar) bloqueaban fechas
- Usuarios no podían reservar fechas "ocupadas" por reservas no pagadas

**Ahora:**
- Solo las reservas `paid` (pagadas) bloquean disponibilidad
- Las reservas `pending` se muestran en el calendario pero NO bloquean fechas
- Limpieza automática de reservas pendientes vencidas (30 minutos)

### Funciones de Disponibilidad

```typescript
// Solo considera reservas pagadas
BookingService.checkAvailability(propertyId, startDate, endDate)

// Incluye reservas pendientes (para casos especiales)
BookingService.checkAvailabilityIncludingPending(propertyId, startDate, endDate)

// Limpia reservas pendientes vencidas
BookingService.cleanupExpiredPendingBookings()
```

### Cron Job Automático

- **Frecuencia:** Cada 15 minutos
- **Función:** Cancela reservas pendientes de más de 30 minutos
- **Configurado en:** `vercel.json`

## Próximos Pasos

- [ ] Agregar notificaciones por email
- [ ] Implementar reembolsos
- [ ] Agregar más métodos de pago
- [ ] Implementar pagos en cuotas
- [ ] Exportar calendario a formatos estándar (iCal)
- [ ] Notificaciones push para nuevas reservas
- [ ] Configurar tiempo de expiración personalizable para reservas pendientes
