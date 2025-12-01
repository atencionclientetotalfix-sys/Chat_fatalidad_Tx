'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Mensaje, ArchivoAdjunto } from '@/types'

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const chatId = params.chatId as string

  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [cargando, setCargando] = useState(false)
  const [cargandoMensajes, setCargandoMensajes] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    cargarMensajes()
  }, [chatId])

  const cargarMensajes = async () => {
    try {
      setError(null)
      const response = await fetch(`/api/chat/mensajes?conversacionId=${chatId}`)
      if (response.ok) {
        const data = await response.json()
        setMensajes(data.mensajes || [])
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Error al cargar mensajes' }))
        setError(errorData.error || 'Error al cargar mensajes')
      }
    } catch (error) {
      console.error('Error al cargar mensajes:', error)
      setError('Error de conexión al cargar mensajes')
    } finally {
      setCargandoMensajes(false)
    }
  }

  const handleEnviarMensaje = async (
    mensaje: string,
    archivos: ArchivoAdjunto[]
  ) => {
    setCargando(true)
    setError(null)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversacionId: chatId,
          mensaje,
          archivos,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error al enviar mensaje' }))
        throw new Error(errorData.error || 'Error al enviar mensaje')
      }

      const { mensajeUsuario, mensajeAsistente } = await response.json()

      setMensajes((prev) => [
        ...prev,
        mensajeUsuario,
        ...(mensajeAsistente ? [mensajeAsistente] : []),
      ])
    } catch (error) {
      console.error('Error:', error)
      const mensajeError = error instanceof Error ? error.message : 'Error al enviar mensaje'
      setError(mensajeError)
    } finally {
      setCargando(false)
    }
  }

  const handleSubirArchivo = async (archivo: File): Promise<string> => {
    const formData = new FormData()
    formData.append('archivo', archivo)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) throw new Error('Error al subir archivo')

    const data = await response.json()
    return data.id
  }

  const handleExportar = async () => {
    try {
      const response = await fetch('/api/chat/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversacionId: chatId }),
      })

      if (!response.ok) throw new Error('Error al exportar')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `conversacion-${chatId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleEliminar = async () => {
    if (!confirm('¿Estás seguro de eliminar esta conversación?')) return

    try {
      const response = await fetch(`/api/chat/conversacion/${chatId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (cargandoMensajes) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground-secondary">Cargando conversación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-background-secondary px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Control de Fatalidad TX
            </h1>
            <p className="text-sm text-foreground-secondary">
              Asistente de seguridad laboral y salud ocupacional
            </p>
          </div>
          <div className="flex gap-2">
            {mensajes.length > 0 && (
              <>
                <Button
                  variante="ghost"
                  tamaño="sm"
                  onClick={handleExportar}
                >
                  <Download size={16} />
                  Exportar PDF
                </Button>
                <Button
                  variante="ghost"
                  tamaño="sm"
                  onClick={handleEliminar}
                >
                  <Trash2 size={16} />
                  Eliminar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <ChatContainer
        mensajes={mensajes}
        cargando={cargando}
        onEnviarMensaje={handleEnviarMensaje}
        onSubirArchivo={handleSubirArchivo}
      />
    </div>
  )
}

