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
    const procesarCodigoRecuperacion = async () => {
      const supabase = createClient()
      let timeoutId: NodeJS.Timeout | null = null
      
      // Función para extraer tokens del hash
      const extraerTokensDelHash = () => {
        if (typeof window === 'undefined' || !window.location.hash) return null
        
        try {
          const hash = window.location.hash.substring(1)
          const params = new URLSearchParams(hash)
          
          const accessToken = params.get('access_token')
          const refreshToken = params.get('refresh_token')
          const type = params.get('type')
          
          console.log('Tokens extraídos del hash:', { 
            tieneAccessToken: !!accessToken, 
            tieneRefreshToken: !!refreshToken,
            type 
          })
          
          if (accessToken && type === 'recovery') {
            return { accessToken, refreshToken }
          }
        } catch (err) {
          console.error('Error al extraer tokens del hash:', err)
        }
        
        return null
      }
      
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
      
      console.log('Código detectado en URL, procesando...')
      
      // Timeout de seguridad (30 segundos)
      timeoutId = setTimeout(() => {
        setError('La verificación está tomando demasiado tiempo. Por favor intenta nuevamente.')
        setVerificandoToken(false)
        setTokenValido(false)
      }, 30000)
      
      try {
        // Primero verificar si ya hay una sesión establecida
        const { data: { session: sessionInicial }, error: errorInicial } = await supabase.auth.getSession()
        
        if (sessionInicial) {
          console.log('✅ Sesión ya estaba establecida')
          if (timeoutId) clearTimeout(timeoutId)
          setTokenValido(true)
          setVerificandoToken(false)
          if (typeof window !== 'undefined') {
            window.history.replaceState({}, '', '/restablecer-contraseña')
          }
          return
        }
        
        // Intentar extraer tokens del hash
        const tokens = extraerTokensDelHash()
        
        if (tokens && tokens.accessToken) {
          console.log('Estableciendo sesión con access_token del hash...')
          
          // Establecer la sesión usando setSession
          const { data, error: setSessionError } = await supabase.auth.setSession({
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken || '',
          })
          
          if (setSessionError) {
            console.error('Error al establecer sesión:', setSessionError)
            throw setSessionError
          }
          
          if (data.session) {
            console.log('✅ Sesión establecida correctamente desde el hash')
            if (timeoutId) clearTimeout(timeoutId)
            setTokenValido(true)
            setVerificandoToken(false)
            if (typeof window !== 'undefined') {
              window.history.replaceState({}, '', '/restablecer-contraseña')
            }
            return
          }
        }
        
        // Si no hay tokens en el hash, intentar con query params (código)
        const codigo = searchParams.get('code') || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('code') : null)
        
        if (codigo) {
          console.log('Intentando procesar código de query params...')
          // Para códigos en query params, Supabase debería procesarlos automáticamente
          // Esperar un momento y verificar la sesión
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const { data: { session: sessionDespues }, error: errorDespues } = await supabase.auth.getSession()
          
          if (sessionDespues) {
            console.log('✅ Sesión establecida después de procesar código')
            if (timeoutId) clearTimeout(timeoutId)
            setTokenValido(true)
            setVerificandoToken(false)
            if (typeof window !== 'undefined') {
              window.history.replaceState({}, '', '/restablecer-contraseña')
            }
            return
          }
        }
        
        // Si llegamos aquí, no se pudo establecer la sesión
        console.error('❌ No se pudo establecer la sesión')
        console.error('Hash:', window.location.hash?.substring(0, 200))
        console.error('Search:', window.location.search)
        if (timeoutId) clearTimeout(timeoutId)
        setError('El enlace ha expirado o es inválido. Por favor solicita un nuevo enlace de recuperación.')
        setVerificandoToken(false)
        setTokenValido(false)
        
      } catch (err: any) {
        console.error('Error al procesar código de recuperación:', err)
        if (timeoutId) clearTimeout(timeoutId)
        setError(`Error al verificar el enlace: ${err.message || 'Error desconocido'}. Por favor solicita uno nuevo.`)
        setVerificandoToken(false)
        setTokenValido(false)
      }
    }
    
    // Pequeño delay para asegurar que el hash esté disponible
    const timer = setTimeout(() => {
      procesarCodigoRecuperacion()
    }, 300)
    
    // Cleanup function
    return () => {
      clearTimeout(timer)
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
