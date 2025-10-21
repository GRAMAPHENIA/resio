import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const supabase = createClient()
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  return (
    <div>
      <h1>Dashboard</h1>
      {user ? <p>Welcome, {user.email}</p> : <p>Loading...</p>}
    </div>
  )
}