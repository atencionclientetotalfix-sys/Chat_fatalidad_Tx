'use client'

import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { Loading } from '@/components/ui/loading'
import { Mensaje, ArchivoAdjunto } from '@/types'

interface ChatContainerProps {
  mensajes: Mensaje[]
  cargando: boolean
  onEnviarMensaje: (mensaje: string, archivos: ArchivoAdjunto[]) => Promise<void>
  onSubirArchivo: (archivo: File) => Promise<string>
}

export function ChatContainer({
  mensajes,
  cargando,
  onEnviarMensaje,
  onSubirArchivo,
}: ChatContainerProps) {
  const mensajesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, cargando])

  return (
    <div className="flex flex-col h-full">
      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {mensajes.length === 0 && !cargando && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Control de Fatalidad TX
            </h3>
            <p className="text-foreground-secondary max-w-md">
              Eres un asistente experto en seguridad laboral y salud ocupacional,
              especializado en obras de construcción eléctrica de transmisión en Chile.
            </p>
            <p className="text-foreground-muted text-sm mt-4">
              Comienza a escribir para iniciar una conversación
            </p>
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-4">
          {mensajes.map((mensaje) => (
            <MessageBubble key={mensaje.id} mensaje={mensaje} />
          ))}
          {cargando && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <div className="bg-background-secondary border border-border rounded-lg px-4 py-3">
                <Loading tamaño="sm" />
              </div>
            </div>
          )}
          <div ref={mensajesEndRef} />
        </div>
      </div>

      {/* Input de chat */}
      <ChatInput
        onEnviar={onEnviarMensaje}
        cargando={cargando}
        onSubirArchivo={onSubirArchivo}
      />
    </div>
  )
}

