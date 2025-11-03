'use client'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import React from 'react'

const page = () => {
  const router = useRouter()
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }
  return (
    <div>
      <h1>Feed</h1>
      <button onClick={handleLogout}>Log out</button>
    </div>
  )
}

export default page
