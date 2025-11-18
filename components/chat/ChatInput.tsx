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
    <div className="border-t border-border bg-background-secondary dark:bg-background-secondary p-4 shadow-lg dark:shadow-2xl">
      {mostrarUpload && (
        <div className="mb-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground-secondary dark:text-foreground-secondary">
              Archivos adjuntos
            </span>
            <button
              onClick={() => setMostrarUpload(false)}
              className="text-foreground-secondary hover:text-foreground dark:hover:text-foreground transition-colors p-1 rounded hover:bg-background-tertiary"
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

      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <button
          type="button"
          onClick={() => setMostrarUpload(!mostrarUpload)}
          className={`
            flex-shrink-0 p-3 rounded-xl transition-all duration-200
            ${mostrarUpload 
              ? 'bg-primary dark:bg-primary text-white shadow-md scale-105' 
              : 'bg-background-tertiary dark:bg-background-tertiary text-foreground-secondary dark:text-foreground-secondary hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary hover:scale-105'
            }
          `}
          aria-label="Adjuntar archivo"
        >
          <Paperclip size={20} />
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje..."
            className="
              w-full
              px-4 py-3
              bg-background-tertiary dark:bg-background-tertiary
              border border-border dark:border-border
              rounded-xl
              text-foreground dark:text-foreground
              placeholder:text-foreground-muted dark:placeholder:text-foreground-muted
              focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-transparent
              resize-none
              max-h-32
              min-h-[48px]
              transition-all duration-200
              shadow-sm dark:shadow-md
              hover:shadow-md dark:hover:shadow-lg
            "
            rows={1}
            disabled={cargando}
          />
        </div>

        <Button
          type="submit"
          variante="primary"
          disabled={(!mensaje.trim() && archivos.length === 0) || cargando}
          className="flex-shrink-0 p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} className={cargando ? 'animate-pulse' : ''} />
        </Button>
      </form>
    </div>
  )
}


