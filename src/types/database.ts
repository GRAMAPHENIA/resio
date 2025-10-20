export interface Property {
  id: string
  title: string
  description: string
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  area: number
  images: string[]
  amenities: string[]
  available: boolean
  owner_id: string
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  property_id: string
  user_id: string
  check_in: string
  check_out: string
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled'
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