import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

// Configurar MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: { timeout: 5000 }
})

const preference = new Preference(client)
const payment = new Payment(client)

export interface CreatePreferenceData {
  title: string
  quantity: number
  unit_price: number
  currency_id: string
  description?: string
  external_reference?: string
  payer?: {
    name?: string
    email?: string
  }
}

export interface PreferenceResponse {
  id: string
  init_point: string
  sandbox_init_point: string
}

export interface PaymentDetails {
  id: number
  status: string
  status_detail: string
  external_reference: string
  transaction_amount: number
  date_created: string
  date_approved?: string
  payer: {
    email: string
    identification?: {
      type: string
      number: string
    }
  }
}

export class MercadoPagoService {
  static async createPreference(data: CreatePreferenceData): Promise<PreferenceResponse> {
    try {
      const preferenceData = {
        items: [
          {
            id: `item_${Date.now()}`,
            title: data.title,
            quantity: data.quantity,
            unit_price: data.unit_price,
            currency_id: data.currency_id,
            description: data.description || ''
          }
        ],
        external_reference: data.external_reference || '',
        payer: data.payer ? {
          name: data.payer.name || '',
          email: data.payer.email || ''
        } : {
          name: '',
          email: ''
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/reservas/exito`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/reservas/fallo`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/reservas/pendiente`
        },
        auto_return: 'approved' as const,
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago/webhook`
      }

      const response = await preference.create({ body: preferenceData })
      
      return {
        id: response.id!,
        init_point: response.init_point!,
        sandbox_init_point: response.sandbox_init_point!
      }
    } catch (error) {
      console.error('Error creating MercadoPago preference:', error)
      throw new Error('Error al crear la preferencia de pago')
    }
  }

  static async getPayment(paymentId: string | number): Promise<PaymentDetails | null> {
    try {
      const response = await payment.get({ id: paymentId })
      
      if (!response) return null

      return {
        id: response.id!,
        status: response.status!,
        status_detail: response.status_detail!,
        external_reference: response.external_reference!,
        transaction_amount: response.transaction_amount!,
        date_created: response.date_created!,
        date_approved: response.date_approved || undefined,
        payer: {
          email: response.payer?.email || '',
          identification: response.payer?.identification ? {
            type: response.payer.identification.type || '',
            number: response.payer.identification.number || ''
          } : undefined
        }
      }
    } catch (error) {
      console.error('Error getting payment details:', error)
      return null
    }
  }

  static async verifyPayment(paymentId: string | number, expectedAmount: number, expectedReference: string): Promise<boolean> {
    try {
      const paymentDetails = await this.getPayment(paymentId)
      
      if (!paymentDetails) return false

      return (
        paymentDetails.status === 'approved' &&
        paymentDetails.transaction_amount === expectedAmount &&
        paymentDetails.external_reference === expectedReference
      )
    } catch (error) {
      console.error('Error verifying payment:', error)
      return false
    }
  }
}