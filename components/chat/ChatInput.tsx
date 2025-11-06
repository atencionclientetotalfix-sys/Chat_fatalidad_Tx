'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FileUpload } from './FileUpload'
import { ArchivoAdjunto } from '@/types'

interface ChatInputProps {
  onEnviar: (mensaje: string, archivos: ArchivoAdjunto[]) => void
  cargando: boolean
  onSubirArchivo: (archivo: File) => Promise<string>
}

export function ChatInput({
  onEnviar,
  cargando,
  onSubirArchivo,
}: ChatInputProps) {
  const [mensaje, setMensaje] = useState('')
  const [archivos, setArchivos] = useState<ArchivoAdjunto[]>([])
  const [mostrarUpload, setMostrarUpload] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [mensaje])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((mensaje.trim() || archivos.length > 0) && !cargando) {
      onEnviar(mensaje, archivos)
      setMensaje('')
      setArchivos([])
      setMostrarUpload(false)
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="border-t border-border bg-background-secondary p-4">
      {mostrarUpload && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-foreground-secondary">Archivos adjuntos</span>
            <button
              onClick={() => setMostrarUpload(false)}
              className="text-foreground-secondary hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>
          <FileUpload
            archivos={archivos}
            onArchivosChange={setArchivos}
            onSubirArchivo={onSubirArchivo}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <button
          type="button"
          onClick={() => setMostrarUpload(!mostrarUpload)}
          className={`
            flex-shrink-0 p-2 rounded-lg transition-colors
            ${mostrarUpload ? 'bg-primary text-white' : 'hover:bg-background-tertiary text-foreground-secondary'}
          `}
        >
          <Paperclip size={20} />
        </button>

        <textarea
          ref={textareaRef}
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu mensaje..."
          className="
            flex-1
            px-4 py-2
            bg-background-tertiary
            border border-border
            rounded-lg
            text-foreground
            placeholder:text-foreground-muted
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            resize-none
            max-h-32
            min-h-[44px]
          "
          rows={1}
          disabled={cargando}
        />

        <Button
          type="submit"
          variante="primary"
          disabled={(!mensaje.trim() && archivos.length === 0) || cargando}
        >
          <Send size={20} />
        </Button>
      </form>
    </div>
  )
}


