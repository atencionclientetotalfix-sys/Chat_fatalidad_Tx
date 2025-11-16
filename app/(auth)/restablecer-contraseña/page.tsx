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
    // Intercambiar el código por una sesión
    const intercambiarCodigo = async () => {
      const codigo = searchParams.get('code')
      
      if (!codigo) {
        setError('Enlace inválido. Por favor solicita un nuevo enlace de recuperación.')
        setVerificandoToken(false)
        setTokenValido(false)
        return
      }

      try {
        const supabase = createClient()
        
        // Intercambiar el código por una sesión
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(codigo)

        if (exchangeError) {
          setError('El enlace ha expirado o es inválido. Por favor solicita uno nuevo.')
          setVerificandoToken(false)
          setTokenValido(false)
          return
        }

        if (data.session) {
          setTokenValido(true)
          setVerificandoToken(false)
          // Limpiar el código de la URL sin perder el estado
          window.history.replaceState({}, '', '/restablecer-contraseña')
        } else {
          setError('No se pudo establecer la sesión. Por favor intenta nuevamente.')
          setTokenValido(false)
          setVerificandoToken(false)
        }
      } catch (err) {
        setError('Ocurrió un error al verificar el enlace. Por favor intenta nuevamente.')
        setTokenValido(false)
      } finally {
        setVerificandoToken(false)
      }
    }
    
    intercambiarCodigo()
  }, [searchParams, router])

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
