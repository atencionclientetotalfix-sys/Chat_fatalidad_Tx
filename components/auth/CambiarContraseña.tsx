'use client'

import { useState } from 'react'
import { Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import { createClient } from '@/lib/supabase/client'

export function CambiarContraseña() {
  const [contraseñaActual, setContraseñaActual] = useState('')
  const [nuevaContraseña, setNuevaContraseña] = useState('')
  const [confirmarContraseña, setConfirmarContraseña] = useState('')
  const [cargando, setCargando] = useState(false)
  const [exitoso, setExitoso] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setExitoso(false)
    setCargando(true)

    // Validaciones
    if (nuevaContraseña.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.')
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
      
      // Primero verificar la contraseña actual intentando un re-login
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user?.email) {
        setError('No se pudo verificar el usuario.')
        setCargando(false)
        return
      }

      // Intentar hacer login con la contraseña actual para verificarla
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
        setError(updateError.message)
        setCargando(false)
        return
      }

      setExitoso(true)
      setContraseñaActual('')
      setNuevaContraseña('')
      setConfirmarContraseña('')
      
      // Limpiar el mensaje de éxito después de 5 segundos
      setTimeout(() => setExitoso(false), 5000)
    } catch (err) {
      setError('Ocurrió un error inesperado. Por favor intenta nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="max-w-md">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Cambiar Contraseña
      </h3>

      {exitoso && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-500 text-sm">
          <CheckCircle size={16} />
          <span>Contraseña actualizada exitosamente</span>
        </div>
      )}

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
        />

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
          label="Confirmar nueva contraseña"
          placeholder="Repite tu nueva contraseña"
          value={confirmarContraseña}
          onChange={(e) => setConfirmarContraseña(e.target.value)}
          required
          disabled={cargando}
        />

        <Button
          type="submit"
          variante="primary"
          tamaño="md"
          disabled={cargando}
        >
          {cargando ? (
            <>
              <Loading tamaño="sm" />
              Actualizando...
            </>
          ) : (
            <>
              <Lock size={18} />
              Actualizar contraseña
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

