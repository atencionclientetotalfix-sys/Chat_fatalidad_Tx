'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
import { createClient } from '@/lib/supabase/client'

function RestablecerContraseñaForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [nuevaContraseña, setNuevaContraseña] = useState('')
  const [confirmarContraseña, setConfirmarContraseña] = useState('')
  const [cargando, setCargando] = useState(false)
  const [exitoso, setExitoso] = useState(false)
  const [error, setError] = useState('')
  const [verificandoToken, setVerificandoToken] = useState(true)
  const [tokenValido, setTokenValido] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let timeoutId: NodeJS.Timeout | null = null
    let authListener: { data: { subscription: any } } | null = null
    
    // Verificar si hay código en la URL
    const tieneCodigo = () => {
      if (typeof window === 'undefined') return false
      return !!(window.location.hash || window.location.search || searchParams.get('code'))
    }
    
    // Si no hay código, no es un enlace de recuperación válido
    if (!tieneCodigo()) {
      console.log('No se encontró código en la URL')
      setError('Enlace inválido. Por favor solicita un nuevo enlace de recuperación.')
      setVerificandoToken(false)
      setTokenValido(false)
      return
    }
    
    console.log('Código detectado en URL, esperando a que Supabase procese...')
    
    // Timeout de seguridad (30 segundos)
    timeoutId = setTimeout(() => {
      setError('La verificación está tomando demasiado tiempo. Por favor intenta nuevamente.')
      setVerificandoToken(false)
      setTokenValido(false)
      if (authListener) {
        authListener.data.subscription.unsubscribe()
      }
    }, 30000)
    
    // Escuchar cambios en el estado de autenticación
    // Supabase procesará automáticamente el código cuando detecte el hash/query params
    authListener = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'Sesión activa' : 'Sin sesión')
      
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        if (session) {
          console.log('✅ Sesión establecida correctamente')
          if (timeoutId) clearTimeout(timeoutId)
          setTokenValido(true)
          setVerificandoToken(false)
          // Limpiar el código de la URL sin perder el estado
          if (typeof window !== 'undefined') {
            window.history.replaceState({}, '', '/restablecer-contraseña')
          }
          if (authListener) {
            authListener.data.subscription.unsubscribe()
          }
        }
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('✅ Token refrescado, sesión activa')
        if (timeoutId) clearTimeout(timeoutId)
        setTokenValido(true)
        setVerificandoToken(false)
        if (typeof window !== 'undefined') {
          window.history.replaceState({}, '', '/restablecer-contraseña')
        }
        if (authListener) {
          authListener.data.subscription.unsubscribe()
        }
      }
    })
    
    // También verificar la sesión inmediatamente (por si ya está establecida)
    const verificarSesionInicial = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error al verificar sesión inicial:', error)
        } else if (session) {
          console.log('✅ Sesión ya estaba establecida')
          if (timeoutId) clearTimeout(timeoutId)
          setTokenValido(true)
          setVerificandoToken(false)
          if (typeof window !== 'undefined') {
            window.history.replaceState({}, '', '/restablecer-contraseña')
          }
          if (authListener) {
            authListener.data.subscription.unsubscribe()
          }
        } else {
          console.log('No hay sesión inicial, esperando evento de auth...')
        }
      } catch (err) {
        console.error('Error al verificar sesión inicial:', err)
      }
    }
    
    verificarSesionInicial()
    
    // Cleanup function
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (authListener) {
        authListener.data.subscription.unsubscribe()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Solo ejecutar una vez al montar el componente

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    // Validaciones
    if (nuevaContraseña.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      setCargando(false)
      return
    }

    if (nuevaContraseña !== confirmarContraseña) {
      setError('Las contraseñas no coinciden.')
      setCargando(false)
      return
    }

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password: nuevaContraseña
      })

      if (updateError) {
        setError(updateError.message)
        setCargando(false)
        return
      }

      setExitoso(true)
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err) {
      setError('Ocurrió un error inesperado. Por favor intenta nuevamente.')
      setCargando(false)
    }
  }

  if (verificandoToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-base">
        <Card className="w-full max-w-md mx-auto">
          <div className="text-center">
            <Loading tamaño="lg" />
            <p className="mt-4 text-foreground-secondary">
              Verificando enlace de recuperación...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  if (!tokenValido) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-base">
        <Card className="w-full max-w-md mx-auto">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Enlace Inválido
            </h1>
            {error && (
              <p className="text-foreground-secondary mb-6">{error}</p>
            )}
            <Button
              variante="primary"
              tamaño="lg"
              className="w-full"
              onClick={() => router.push('/recuperar-contraseña')}
            >
              Solicitar nuevo enlace
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (exitoso) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-base">
        <Card className="w-full max-w-md mx-auto">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              ¡Contraseña Actualizada!
            </h1>
            <p className="text-foreground-secondary mb-6">
              Tu contraseña ha sido cambiada exitosamente. Serás redirigido al inicio de sesión...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base">
      <Card className="w-full max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Restablecer Contraseña
          </h1>
          <p className="text-foreground-secondary text-sm">
            Ingresa tu nueva contraseña
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            label="Nueva contraseña"
            placeholder="Mínimo 8 caracteres"
            value={nuevaContraseña}
            onChange={(e) => setNuevaContraseña(e.target.value)}
            required
            disabled={cargando}
          />

          <Input
            type="password"
            label="Confirmar contraseña"
            placeholder="Repite tu nueva contraseña"
            value={confirmarContraseña}
            onChange={(e) => setConfirmarContraseña(e.target.value)}
            required
            disabled={cargando}
          />

          <Button
            type="submit"
            variante="primary"
            tamaño="lg"
            className="w-full"
            disabled={cargando}
          >
            {cargando ? (
              <>
                <Loading tamaño="sm" />
                Actualizando...
              </>
            ) : (
              <>
                <Lock size={20} />
                Actualizar contraseña
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default function RestablecerContraseñaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-base">
          <Card className="w-full max-w-md mx-auto">
            <div className="text-center">
              <Loading tamaño="lg" />
              <p className="mt-4 text-foreground-secondary">
                Cargando...
              </p>
            </div>
          </Card>
        </div>
      }
    >
      <RestablecerContraseñaForm />
    </Suspense>
  )
}
