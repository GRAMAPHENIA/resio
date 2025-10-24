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
✅ Webhook para notificaciones (básico)

## Próximos Pasos

- [ ] Implementar verificación completa de pagos en webhook
- [ ] Agregar notificaciones por email
- [ ] Implementar reembolsos
- [ ] Agregar más métodos de pago
- [ ] Implementar pagos en cuotas