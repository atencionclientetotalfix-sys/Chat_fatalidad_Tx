'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Suspense } from 'react'
import { Loading } from '@/components/ui/loading'

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const manejarRedireccion = async () => {
      const codigo = searchParams.get('code')
      
      // Si hay un código de recuperación, redirigir a la página de restablecer contraseña
      if (codigo) {
        router.replace(`/restablecer-contraseña?code=${codigo}`)
        return
      }

      // Verificar sesión
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
    }

    manejarRedireccion()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading tamaño="lg" />
    </div>
  )
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loading tamaño="lg" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  )
}


