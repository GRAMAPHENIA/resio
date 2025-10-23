import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { booking_id, amount, property_name, user_name, user_email } = await request.json()

    // For now, skip Mercado Pago and just return a mock preference ID
    // This allows testing the booking flow without MP credentials
    console.log('Creating preference for:', { booking_id, amount, property_name, user_name, user_email })

    // Mock preference ID for testing
    const mockPreferenceId = `mock_${booking_id}_${Date.now()}`

    return NextResponse.json({ preferenceId: mockPreferenceId })
  } catch (error) {
    console.error('Error creating preference:', error)
    return NextResponse.json({ error: 'Error creating payment preference' }, { status: 500 })
  }
}