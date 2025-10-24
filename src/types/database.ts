export interface Property {
  id: string
  name: string
  description: string
  location: string
  price_per_night: number
  images: string[]
  owner_id: string
  available: boolean
  bedrooms: number
  bathrooms: number
  area: number
  created_at: string
}

export interface Booking {
  id: string
  property_id: string
  user_name: string
  user_email: string
  user_phone?: string
  start_date: string
  end_date: string
  status: 'pending' | 'paid' | 'cancelled'
  payment_id?: string
  amount: number
  created_at: string
}

export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  phone?: string
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  property_id: string
  created_at: string
}