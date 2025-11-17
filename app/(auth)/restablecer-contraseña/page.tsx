'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
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
  const procesandoRef = useRef(false)

  useEffect(() => {
    // Intercambiar el código por una sesión
    const intercambiarCodigo = async () => {
      if (procesandoRef.current) return
      procesandoRef.current = true
      
      // Delay más largo para asegurar que el hash esté disponible (especialmente en Vercel)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      let codigo: string | null = null
      
      // Función helper para extraer código de diferentes formatos
      const extraerCodigo = (): string | null => {
        if (typeof window === 'undefined') return null
        
        // 1. Intentar desde el hash (formato más común: #access_token=xxx&type=recovery&code=xxx)
        if (window.location.hash) {
          try {
            const hash = window.location.hash.substring(1)
            // Intentar parsear como URLSearchParams
            const hashParams = new URLSearchParams(hash)
            codigo = hashParams.get('code') || hashParams.get('access_token')
            
            // Si no funciona, intentar buscar directamente en el hash
            if (!codigo) {
              const codeMatch = hash.match(/code=([^&]+)/)
              if (codeMatch) codigo = codeMatch[1]
            }
            
            if (codigo) {
              console.log('✅ Código encontrado en hash')
              return codigo
            }
          } catch (err) {
            console.error('Error al parsear hash:', err)
          }
        }
        
        // 2. Intentar desde searchParams (Next.js)
        try {
          const codigoSearch = searchParams.get('code')
          if (codigoSearch) {
            console.log('✅ Código encontrado en searchParams')
            return codigoSearch
          }
        } catch (err) {
          console.error('Error al leer searchParams:', err)
        }
        
        // 3. Intentar directamente desde window.location.search
        if (window.location.search) {
          try {
            const urlParams = new URLSearchParams(window.location.search)
            const codigoUrl = urlParams.get('code')
            if (codigoUrl) {
              console.log('✅ Código encontrado en URL search')
              return codigoUrl
            }
          } catch (err) {
            console.error('Error al parsear URL search:', err)
          }
        }
        
        return null
      }
      
      // Intentar múltiples veces (por si el hash se carga después)
      for (let intento = 0; intento < 3; intento++) {
        codigo = extraerCodigo()
        if (codigo) break
        
        if (intento < 2) {
          console.log(`Intento ${intento + 1} fallido, esperando...`)
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }
      
      if (!codigo) {
        console.error('❌ No se encontró código en la URL después de 3 intentos')
        console.error('Hash completo:', window.location.hash?.substring(0, 200))
        console.error('Search completo:', window.location.search)
        console.error('URL completa:', window.location.href)
        setError('Enlace inválido. Por favor solicita un nuevo enlace de recuperación.')
        setVerificandoToken(false)
        setTokenValido(false)
        procesandoRef.current = false
        return
      }

      // Timeout de seguridad (30 segundos)
      let timeoutCompletado = false
      const timeoutId = setTimeout(() => {
        timeoutCompletado = true
        setError('La verificación está tomando demasiado tiempo. Por favor intenta nuevamente.')
        setVerificandoToken(false)
        setTokenValido(false)
        procesandoRef.current = false
      }, 30000)

      try {
        const supabase = createClient()
        
        console.log('Intentando intercambiar código por sesión...', { codigoLength: codigo.length })
        
        // Intercambiar el código por una sesión
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(codigo)

        clearTimeout(timeoutId)
        
        if (timeoutCompletado) {
          procesandoRef.current = false
          return // Ya se manejó el error del timeout
        }

        if (exchangeError) {
          console.error('Error al intercambiar código:', exchangeError)
          setError(`El enlace ha expirado o es inválido: ${exchangeError.message}. Por favor solicita uno nuevo.`)
          setVerificandoToken(false)
          setTokenValido(false)
          procesandoRef.current = false
          return
        }

        if (data?.session) {
          console.log('Sesión establecida correctamente')
          setTokenValido(true)
          setVerificandoToken(false)
          // Limpiar el código de la URL sin perder el estado
          if (typeof window !== 'undefined') {
            window.history.replaceState({}, '', '/restablecer-contraseña')
          }
        } else {
          console.error('No se recibió sesión en la respuesta')
          setError('No se pudo establecer la sesión. Por favor intenta nuevamente.')
          setTokenValido(false)
          setVerificandoToken(false)
        }
        procesandoRef.current = false
      } catch (err) {
        if (!timeoutCompletado) {
          clearTimeout(timeoutId)
        }
        console.error('Error al verificar enlace:', err)
        if (!timeoutCompletado) {
          setError('Ocurrió un error al verificar el enlace. Por favor intenta nuevamente.')
          setTokenValido(false)
          setVerificandoToken(false)
        }
        procesandoRef.current = false
      }
    }
    
    // Ejecutar inmediatamente
    intercambiarCodigo()
    
    // También escuchar cambios en el hash (por si se carga después)
    const handleHashChange = () => {
      if (!procesandoRef.current && window.location.hash) {
        intercambiarCodigo()
      }
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', handleHashChange)
    }
    
    // Cleanup function
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('hashchange', handleHashChange)
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
