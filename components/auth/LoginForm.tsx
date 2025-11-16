'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  // Verificar si hay mensajes de error en la URL
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'no_autorizado') {
      setError('Tu acceso ha sido revocado. Por favor contacta al administrador.')
    } else if (errorParam === 'email_no_disponible') {
      setError('No se pudo verificar tu email. Por favor intenta nuevamente.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      // Verificar email permitido mediante API
      const verificacionResponse = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const verificacion = await verificacionResponse.json()

      if (!verificacion.permitido) {
        setError(verificacion.mensaje || 'Acceso denegado. Este correo no está autorizado.')
        setCargando(false)
        return
      }

      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Credenciales incorrectas. Verifica tu correo y contraseña.')
        } else {
          setError(authError.message)
        }
        setCargando(false)
        return
      }

      if (data.session) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Ocurrió un error inesperado. Por favor intenta nuevamente.')
      setCargando(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Asistente HS Etchegaray
        </h1>
        <p className="text-foreground-secondary text-sm">
          Inicia sesión para continuar
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

        <Input
          type="password"
          label="Contraseña"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={cargando}
        />

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
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
              Iniciando sesión...
            </>
          ) : (
            <>
              <Lock size={20} />
              Iniciar sesión
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-border text-center">
        <p className="text-xs text-foreground-muted">
          Desarrollado por{' '}
          <a
            href="https://www.automatizafix.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            AutomatizaFix
          </a>
        </p>
      </div>
    </Card>
  )
}


