import { BookingWithProperty } from './booking.service'

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text: string
}

export class EmailService {
  /**
   * Crear email de confirmación de reserva
   */
  static createBookingConfirmationEmail(booking: BookingWithProperty): EmailTemplate {
    const nights = Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24))
    const checkInDate = new Date(booking.start_date).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const checkOutDate = new Date(booking.end_date).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de Reserva - Resio</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .status-confirmed { background: #10b981; color: white; padding: 10px; text-align: center; border-radius: 4px; margin: 20px 0; }
          .important-info { background: #3b82f6; color: white; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .footer { background: #374151; color: white; padding: 20px; text-align: center; font-size: 14px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Reserva Confirmada!</h1>
            <p>Tu alojamiento está asegurado</p>
          </div>
          
          <div class="content">
            <div class="status-confirmed">
              <h2>✓ PAGO CONFIRMADO - RESERVA ASEGURADA</h2>
            </div>
            
            <p>Hola <strong>${booking.user_name}</strong>,</p>
            
            <p>¡Excelente noticia! Tu reserva ha sido confirmada y el pago procesado exitosamente. Ya puedes estar tranquilo/a, tu alojamiento está asegurado.</p>
            
            <div class="booking-details">
              <h3>📍 Detalles de tu Reserva</h3>
              
              <p><strong>Alojamiento:</strong> ${booking.property.name}</p>
              <p><strong>Ubicación:</strong> ${booking.property.location}</p>
              <p><strong>Código de Reserva:</strong> ${booking.id.slice(0, 8).toUpperCase()}</p>
              
              <hr>
              
              <p><strong>Check-in:</strong> ${checkInDate} a partir de las 15:00 hs</p>
              <p><strong>Check-out:</strong> ${checkOutDate} hasta las 11:00 hs</p>
              <p><strong>Duración:</strong> ${nights} ${nights === 1 ? 'noche' : 'noches'}</p>
              
              <hr>
              
              <p><strong>Huésped:</strong> ${booking.user_name}</p>
              <p><strong>Email:</strong> ${booking.user_email}</p>
              <p><strong>Total Pagado:</strong> $${booking.amount.toLocaleString('es-AR')}</p>
              ${booking.payment_id ? `<p><strong>ID de Pago:</strong> ${booking.payment_id}</p>` : ''}
            </div>
            
            <div class="important-info">
              <h3>📋 Información Importante</h3>
              <ul>
                <li><strong>Contacto previo:</strong> El propietario se contactará contigo 24-48hs antes del check-in para coordinar la entrega de llaves</li>
                <li><strong>Documentación:</strong> Lleva tu DNI o documento de identidad para el registro</li>
                <li><strong>Horarios:</strong> Check-in desde 15:00hs / Check-out hasta 11:00hs</li>
                <li><strong>Tu reserva:</strong> Ya está agendada en nuestro calendario y es visible para el propietario</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/reservas/detalle/${booking.id}" class="button">
                Ver Detalles Completos
              </a>
              <br>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/tablero/reservas" class="button" style="background: #6b7280;">
                Mis Reservas
              </a>
            </div>
            
            <p><strong>¿Necesitas ayuda?</strong></p>
            <p>📞 <strong>Teléfono:</strong> +54 9 11 1234-5678 (Lun a Dom 9:00-21:00)</p>
            <p>📧 <strong>Email:</strong> soporte@resio.com</p>
            
            <p>¡Que disfrutes tu estadía!</p>
            <p><strong>El equipo de Resio</strong></p>
          </div>
          
          <div class="footer">
            <p>Este email confirma tu reserva. Guárdalo para tus registros.</p>
            <p>Resio - Alojamientos que conectan</p>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: #93c5fd;">www.resio.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
¡RESERVA CONFIRMADA!

Hola ${booking.user_name},

Tu reserva ha sido confirmada y el pago procesado exitosamente.

DETALLES DE TU RESERVA:
- Alojamiento: ${booking.property.name}
- Ubicación: ${booking.property.location}
- Código: ${booking.id.slice(0, 8).toUpperCase()}
- Check-in: ${checkInDate} desde 15:00hs
- Check-out: ${checkOutDate} hasta 11:00hs
- Duración: ${nights} ${nights === 1 ? 'noche' : 'noches'}
- Total: $${booking.amount.toLocaleString('es-AR')}

INFORMACIÓN IMPORTANTE:
- El propietario se contactará contigo 24-48hs antes del check-in
- Lleva tu DNI para el registro
- Tu reserva ya está agendada en nuestro calendario

¿Necesitas ayuda?
Teléfono: +54 9 11 1234-5678
Email: soporte@resio.com

Ver detalles: ${process.env.NEXT_PUBLIC_SITE_URL}/reservas/detalle/${booking.id}

¡Que disfrutes tu estadía!
El equipo de Resio
    `

    return {
      to: booking.user_email,
      subject: `✓ Reserva Confirmada - ${booking.property.name} | Resio`,
      html,
      text
    }
  }

  /**
   * Crear email de reserva pendiente
   */
  static createBookingPendingEmail(booking: BookingWithProperty): EmailTemplate {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reserva Pendiente - Resio</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .warning { background: #fbbf24; color: #92400e; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Reserva Pendiente</h1>
            <p>Completa tu pago para confirmar</p>
          </div>
          
          <div class="content">
            <div class="warning">
              <h3>⚠️ ACCIÓN REQUERIDA</h3>
              <p>Tu reserva expirará en 30 minutos si no completas el pago.</p>
            </div>
            
            <p>Hola <strong>${booking.user_name}</strong>,</p>
            
            <p>Hemos recibido tu solicitud de reserva para <strong>${booking.property.name}</strong>, pero aún no hemos recibido el pago.</p>
            
            <p><strong>Para confirmar tu reserva:</strong></p>
            <ol>
              <li>Haz clic en el botón "Completar Pago"</li>
              <li>Completa el proceso de pago</li>
              <li>Recibirás la confirmación inmediatamente</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/reservas/detalle/${booking.id}" class="button">
                Completar Pago Ahora
              </a>
            </div>
            
            <p><strong>Detalles de tu reserva:</strong></p>
            <ul>
              <li>Alojamiento: ${booking.property.name}</li>
              <li>Fechas: ${new Date(booking.start_date).toLocaleDateString('es-AR')} - ${new Date(booking.end_date).toLocaleDateString('es-AR')}</li>
              <li>Total: $${booking.amount.toLocaleString('es-AR')}</li>
            </ul>
            
            <p>Si tienes problemas, contáctanos:</p>
            <p>📞 +54 9 11 1234-5678 | 📧 soporte@resio.com</p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
RESERVA PENDIENTE - ACCIÓN REQUERIDA

Hola ${booking.user_name},

Tu reserva para ${booking.property.name} está pendiente de pago.

IMPORTANTE: Tu reserva expirará en 30 minutos si no completas el pago.

Para confirmar:
1. Ve a: ${process.env.NEXT_PUBLIC_SITE_URL}/reservas/detalle/${booking.id}
2. Completa el pago
3. Recibirás la confirmación inmediata

Detalles:
- Alojamiento: ${booking.property.name}
- Fechas: ${new Date(booking.start_date).toLocaleDateString('es-AR')} - ${new Date(booking.end_date).toLocaleDateString('es-AR')}
- Total: $${booking.amount.toLocaleString('es-AR')}

¿Problemas? Contáctanos:
📞 +54 9 11 1234-5678
📧 soporte@resio.com
    `

    return {
      to: booking.user_email,
      subject: `⏰ Completa tu reserva - ${booking.property.name} | Resio`,
      html,
      text
    }
  }

  /**
   * Simular envío de email (en producción usarías un servicio real como SendGrid, Resend, etc.)
   */
  static async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      // En desarrollo, solo logueamos el email
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 EMAIL SIMULADO:')
        console.log('To:', template.to)
        console.log('Subject:', template.subject)
        console.log('Text:', template.text)
        return true
      }

      // Aquí integrarías con tu servicio de email preferido
      // Ejemplo con fetch a un servicio de email:
      /*
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Resio <noreply@resio.com>',
          to: [template.to],
          subject: template.subject,
          html: template.html,
          text: template.text,
        }),
      })

      return response.ok
      */

      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }
}