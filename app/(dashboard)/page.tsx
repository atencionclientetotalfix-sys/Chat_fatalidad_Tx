'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Mensaje, ArchivoAdjunto } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const [conversacionId, setConversacionId] = useState<string | null>(null)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [cargando, setCargando] = useState(false)
  const [creando, setCreando] = useState(false)

  useEffect(() => {
    crearNuevaConversacion()
  }, [])

  const crearNuevaConversacion = async () => {
    setCreando(true)
    try {
      const response = await fetch('/api/chat/thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: 'Control de Fatalidad TX',
          tipoChat: 'control_fatalidad_tx',
        }),
      })

      if (!response.ok) throw new Error('Error al crear conversación')

      const { conversacion } = await response.json()
      setConversacionId(conversacion.id)
      setMensajes([])
      router.push(`/chat/${conversacion.id}`)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setCreando(false)
    }
  }

  const handleEnviarMensaje = async (
    mensaje: string,
    archivos: ArchivoAdjunto[]
  ) => {
    if (!conversacionId) return

    setCargando(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversacionId,
          mensaje,
          archivos,
        }),
      })

      if (!response.ok) throw new Error('Error al enviar mensaje')

      const { mensajeUsuario, mensajeAsistente } = await response.json()

      setMensajes((prev) => [
        ...prev,
        mensajeUsuario,
        ...(mensajeAsistente ? [mensajeAsistente] : []),
      ])
    } catch (error) {
      console.error('Error:', error)
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
    if (!conversacionId) return

    try {
      const response = await fetch('/api/chat/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversacionId }),
      })

      if (!response.ok) throw new Error('Error al exportar')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `conversacion-${conversacionId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleLimpiar = () => {
    if (confirm('¿Estás seguro de limpiar esta conversación?')) {
      setMensajes([])
      crearNuevaConversacion()
    }
  }

  if (creando) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground-secondary">Creando nueva conversación...</p>
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
                  onClick={handleLimpiar}
                >
                  <Trash2 size={16} />
                  Limpiar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

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

