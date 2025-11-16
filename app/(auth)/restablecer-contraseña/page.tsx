'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
import { createClient } from '@/lib/supabase/client'

export default function RestablecerContraseñaPage() {
  const router = useRouter()
  const [nuevaContraseña, setNuevaContraseña] = useState('')
  const [confirmarContraseña, setConfirmarContraseña] = useState('')
  const [cargando, setCargando] = useState(false)
  const [exitoso, setExitoso] = useState(false)
  const [error, setError] = useState('')
  const [verificandoToken, setVerificandoToken] = useState(true)

  useEffect(() => {
    // Verificar que tengamos un token válido
    const verificarToken = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('Enlace inválido o expirado. Por favor solicita uno nuevo.')
      }
      setVerificandoToken(false)
    }
    
    verificarToken()
  }, [])

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
        <Loading tamaño="lg" />
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

