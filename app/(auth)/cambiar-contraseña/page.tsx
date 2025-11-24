'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function CambiarContraseñaPage() {
  const router = useRouter()
  const [contraseñaActual, setContraseñaActual] = useState('')
  const [nuevaContraseña, setNuevaContraseña] = useState('')
  const [confirmarContraseña, setConfirmarContraseña] = useState('')
  const [cargando, setCargando] = useState(false)
  const [verificando, setVerificando] = useState(true)
  const [exitoso, setExitoso] = useState(false)
  const [error, setError] = useState('')
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(false)

  // Verificar que el usuario esté autenticado
  useEffect(() => {
    const verificarAutenticacion = async () => {
      try {
        const supabase = createClient()
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
          router.push('/login?redirect=cambiar-contraseña')
          return
        }

        setUsuarioAutenticado(true)
      } catch (err) {
        console.error('Error al verificar autenticación:', err)
        router.push('/login?redirect=cambiar-contraseña')
      } finally {
        setVerificando(false)
      }
    }

    verificarAutenticacion()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setExitoso(false)
    setCargando(true)

    // Validaciones
    if (!contraseñaActual) {
      setError('Debes ingresar tu contraseña actual.')
      setCargando(false)
      return
    }

    if (nuevaContraseña.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.')
      setCargando(false)
      return
    }

    if (nuevaContraseña === contraseñaActual) {
      setError('La nueva contraseña debe ser diferente a la actual.')
      setCargando(false)
      return
    }

    if (nuevaContraseña !== confirmarContraseña) {
      setError('Las nuevas contraseñas no coinciden.')
      setCargando(false)
      return
    }

    try {
      const supabase = createClient()
      
      // Obtener el usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user?.email) {
        setError('No se pudo verificar el usuario. Por favor inicia sesión nuevamente.')
        setCargando(false)
        return
      }

      // Verificar la contraseña actual intentando un re-login
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: contraseñaActual,
      })

      if (loginError) {
        setError('La contraseña actual es incorrecta.')
        setCargando(false)
        return
      }

      // Si el login fue exitoso, actualizar la contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: nuevaContraseña
      })

      if (updateError) {
        // Manejo de errores específicos de Supabase
        if (updateError.message.includes('same')) {
          setError('La nueva contraseña debe ser diferente a la actual.')
        } else if (updateError.message.includes('weak')) {
          setError('La contraseña es demasiado débil. Usa una contraseña más segura.')
        } else {
          setError(updateError.message || 'Error al actualizar la contraseña.')
        }
        setCargando(false)
        return
      }

      setExitoso(true)
      setContraseñaActual('')
      setNuevaContraseña('')
      setConfirmarContraseña('')
      
      // Redirigir al dashboard después de 3 segundos
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    } catch (err: any) {
      console.error('Error al cambiar contraseña:', err)
      setError('Ocurrió un error inesperado. Por favor intenta nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  if (verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-base">
        <Card className="w-full max-w-md mx-auto">
          <div className="text-center">
            <Loading tamaño="lg" />
            <p className="mt-4 text-foreground-secondary">
              Verificando autenticación...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  if (!usuarioAutenticado) {
    return null // El useEffect redirigirá
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
              Tu contraseña ha sido cambiada exitosamente. Serás redirigido al dashboard...
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
            Cambiar Contraseña
          </h1>
          <p className="text-foreground-secondary text-sm">
            Ingresa tu contraseña actual y la nueva contraseña
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
            label="Contraseña actual"
            placeholder="Tu contraseña actual"
            value={contraseñaActual}
            onChange={(e) => setContraseñaActual(e.target.value)}
            required
            disabled={cargando}
            autoComplete="current-password"
          />

          <Input
            type="password"
            label="Nueva contraseña"
            placeholder="Mínimo 8 caracteres"
            value={nuevaContraseña}
            onChange={(e) => setNuevaContraseña(e.target.value)}
            required
            disabled={cargando}
            autoComplete="new-password"
          />

          <Input
            type="password"
            label="Confirmar nueva contraseña"
            placeholder="Repite tu nueva contraseña"
            value={confirmarContraseña}
            onChange={(e) => setConfirmarContraseña(e.target.value)}
            required
            disabled={cargando}
            autoComplete="new-password"
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

        <div className="mt-6 pt-6 border-t border-border">
          <Link href="/dashboard">
            <Button
              type="button"
              variante="secondary"
              tamaño="md"
              className="w-full"
            >
              <ArrowLeft size={18} />
              Volver al dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/recuperar-contraseña"
            className="text-sm text-primary hover:underline"
          >
            ¿Olvidaste tu contraseña actual?
          </Link>
        </div>
      </Card>
    </div>
  )
}

