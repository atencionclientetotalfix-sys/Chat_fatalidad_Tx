'use client'

import { useState } from 'react'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RecuperarContraseñaPage() {
  const [email, setEmail] = useState('')
  const [cargando, setCargando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      // Primero verificar si el email está permitido
      const verificacionResponse = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const verificacion = await verificacionResponse.json()

      if (!verificacion.permitido) {
        setError('Este correo no está autorizado en el sistema.')
        setCargando(false)
        return
      }

      const supabase = createClient()
      // Usar NEXT_PUBLIC_APP_URL si está disponible, sino usar window.location.origin
      const urlBase = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${urlBase}/restablecer-contraseña`,
      })

      if (resetError) {
        setError(resetError.message)
      } else {
        setEnviado(true)
      }
    } catch (err) {
      setError('Ocurrió un error inesperado. Por favor intenta nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  if (enviado) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-base">
        <Card className="w-full max-w-md mx-auto">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Correo Enviado
            </h1>
            <p className="text-foreground-secondary mb-6">
              Hemos enviado un enlace de recuperación a <strong>{email}</strong>. 
              Revisa tu bandeja de entrada y sigue las instrucciones.
            </p>
            <Link href="/login">
              <Button variante="primary" tamaño="lg" className="w-full">
                <ArrowLeft size={20} />
                Volver al inicio de sesión
              </Button>
            </Link>
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
            Recuperar Contraseña
          </h1>
          <p className="text-foreground-secondary text-sm">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Correo electrónico"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={cargando}
          />

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

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
                Enviando...
              </>
            ) : (
              <>
                <Mail size={20} />
                Enviar enlace de recuperación
              </>
            )}
          </Button>

          <Link href="/login">
            <Button
              type="button"
              variante="secondary"
              tamaño="lg"
              className="w-full"
            >
              <ArrowLeft size={20} />
              Volver al inicio de sesión
            </Button>
          </Link>
        </form>
      </Card>
    </div>
  )
}

