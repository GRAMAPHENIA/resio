import { MercadoPagoConfig, Preference } from 'mercadopago'

// Configurar MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: { timeout: 5000 }
})

const preference = new Preference(client)

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

export class MercadoPagoService {
  static async createPreference(data: CreatePreferenceData): Promise<PreferenceResponse> {
    try {
      const preferenceData = {
        items: [
          {
            title: data.title,
            quantity: data.quantity,
            unit_price: data.unit_price,
            currency_id: data.currency_id,
            description: data.description
          }
        ],
        external_reference: data.external_reference,
        payer: data.payer,
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
}