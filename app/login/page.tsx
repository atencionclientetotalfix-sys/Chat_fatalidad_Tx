import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from '@/components/auth/LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar Sesión - ASISTENTES HSE PROFESIONAL',
  description: 'Inicia sesión en el asistente conversacional',
}

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base p-4">
      <LoginForm />
    </div>
  )
}


