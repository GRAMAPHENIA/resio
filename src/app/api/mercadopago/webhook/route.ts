import { NextRequest, NextResponse } from 'next/server'
import { BookingService } from '@/services/booking.service'
import { MercadoPagoService } from '@/services/mercadopago.service'
import { EmailService } from '@/services/email.service'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Webhook received:', body)

    // Verificar la firma del webhook (opcional pero recomendado)
    if (process.env.MP_WEBHOOK_SECRET) {
      const signature = request.headers.get('x-signature')
      const requestId = request.headers.get('x-request-id')
      
      if (signature && requestId) {
        const expectedSignature = crypto
          .createHmac('sha256', process.env.MP_WEBHOOK_SECRET)
          .update(`${requestId}${JSON.stringify(body)}`)
          .digest('hex')
        
        if (signature !== `v1=${expectedSignature}`) {
          console.error('Invalid webhook signature')
          return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }
      }
    }
    
    // MercadoPago envía diferentes tipos de notificaciones
    if (body.type === 'payment') {
      const paymentId = body.data.id

      if (!paymentId) {
        console.error('No payment ID in webhook')
        return NextResponse.json({ error: 'No payment ID' }, { status: 400 })
      }

      // Obtener los detalles del pago desde MercadoPago
      const paymentDetails = await MercadoPagoService.getPayment(paymentId)

      if (paymentDetails && paymentDetails.external_reference) {
        const reference = paymentDetails.external_reference

        // Verificar si es una referencia temporal (empieza con 'temp_')
        if (reference.startsWith('temp_')) {
          // Es una reserva nueva que debe crearse solo si el pago es aprobado
          if (paymentDetails.status === 'approved') {
            // Obtener los datos temporales de la reserva
            interface TempBookingData {
              property_id: string
              user_name: string
              user_email: string
              user_phone: string
              start_date: string
              end_date: string
              amount: number
              user_id?: string
              created_at: string
            }

            const globalAny = global as unknown as { tempBookings?: Map<string, TempBookingData> }
            const tempBookingData = globalAny.tempBookings?.get(reference)

            if (tempBookingData) {
              try {
                // Crear la reserva real ahora que el pago está confirmado
                const booking = await BookingService.createBooking({
                  property_id: tempBookingData.property_id as string,
                  user_name: tempBookingData.user_name as string,
                  user_email: tempBookingData.user_email as string,
                  user_phone: tempBookingData.user_phone as string | undefined,
                  start_date: tempBookingData.start_date as string,
                  end_date: tempBookingData.end_date as string,
                  amount: tempBookingData.amount as number,
                  user_id: tempBookingData.user_id as string | undefined
                })

                // Actualizar el payment_id de la reserva ya pagada
                await BookingService.updateBookingPayment(
                  booking.id,
                  paymentId.toString(),
                  'paid'
                )

                // Limpiar los datos temporales
                globalAny.tempBookings?.delete(reference)

                console.log(`✅ New booking ${booking.id} created and marked as paid`)

                // Enviar email de confirmación
                try {
                  const bookingWithProperty = await BookingService.getBookingById(booking.id)
                  if (bookingWithProperty) {
                    const emailTemplate = EmailService.createBookingConfirmationEmail(bookingWithProperty)
                    await EmailService.sendEmail(emailTemplate)
                    console.log(`✅ Confirmation email sent to ${bookingWithProperty.user_email}`)
                  }
                } catch (emailError) {
                  console.error('❌ Error sending confirmation email:', emailError)
                }

              } catch (bookingError) {
                console.error('❌ Error creating booking from temp data:', bookingError)
              }
            } else {
              console.error(`❌ Temp booking data not found for reference: ${reference}`)
            }
          }
          // Para pagos no aprobados, simplemente no hacer nada (no crear reserva)
        } else {
          // Es una reserva existente, actualizar su estado
          const bookingId = reference

          // Actualizar el estado de la reserva según el estado del pago
          let bookingStatus: 'paid' | 'cancelled' | 'pending' | null = null

          switch (paymentDetails.status) {
            case 'approved':
              bookingStatus = 'paid'
              break
            case 'cancelled':
            case 'rejected':
              bookingStatus = 'cancelled'
              break
            case 'pending':
            case 'in_process':
              // No actualizamos para pending, ya está en pending por defecto
              console.log(`🔍 Payment ${paymentId} is still pending, no update needed`)
              break
          }

          // Solo actualizar si hay un cambio de estado definitivo
          if (bookingStatus) {
            await BookingService.updateBookingPayment(
              bookingId,
              paymentId.toString(),
              bookingStatus
            )
            console.log(`✅ Booking ${bookingId} updated to ${bookingStatus}`)

            // Enviar email de confirmación si el pago fue aprobado
            if (bookingStatus === 'paid') {
              try {
                const booking = await BookingService.getBookingById(bookingId)
                if (booking) {
                  const emailTemplate = EmailService.createBookingConfirmationEmail(booking)
                  await EmailService.sendEmail(emailTemplate)
                  console.log(`Confirmation email sent to ${booking.user_email}`)
                }
              } catch (emailError) {
                console.error('❌ Error sending confirmation email:', emailError)
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    )
  }
}

// MercadoPago también puede enviar notificaciones via GET
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const topic = searchParams.get('topic')
    const id = searchParams.get('id')

    console.log('GET Webhook:', { topic, id })

    if (topic === 'payment' && id) {
      // Obtener los detalles del pago
      const paymentDetails = await MercadoPagoService.getPayment(id)
      
      if (paymentDetails && paymentDetails.external_reference) {
        const bookingId = paymentDetails.external_reference
        
        let bookingStatus: 'paid' | 'cancelled' | 'pending' | null = null
        
        switch (paymentDetails.status) {
          case 'approved':
            bookingStatus = 'paid'
            break
          case 'cancelled':
          case 'rejected':
            bookingStatus = 'cancelled'
            break
          case 'pending':
          case 'in_process':
            // No actualizamos para pending, ya está en pending por defecto
            console.log(`🔍 Payment ${id} is still pending, no update needed`)
            break
        }

        // Solo actualizar si hay un cambio de estado definitivo
        if (bookingStatus) {
          await BookingService.updateBookingPayment(
            bookingId,
            id,
            bookingStatus
          )
          console.log(`✅ Booking ${bookingId} updated to ${bookingStatus} via GET`)

          // Enviar email de confirmación si el pago fue aprobado
          if (bookingStatus === 'paid') {
            try {
              const booking = await BookingService.getBookingById(bookingId)
              if (booking) {
                const emailTemplate = EmailService.createBookingConfirmationEmail(booking)
                await EmailService.sendEmail(emailTemplate)
                console.log(`Confirmation email sent to ${booking.user_email}`)
              }
            } catch (emailError) {
              console.error('❌ Error sending confirmation email:', emailError)
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('GET Webhook error:', error)
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    )
  }
}