import { User, Bot } from 'lucide-react'
import { Mensaje } from '@/types'

interface MessageBubbleProps {
  mensaje: Mensaje
}

export function MessageBubble({ mensaje }: MessageBubbleProps) {
  const esUsuario = mensaje.rol === 'user'

  return (
    <div
      className={`
        flex gap-3 mb-6
        ${esUsuario ? 'flex-row-reverse' : 'flex-row'}
      `}
    >
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${esUsuario ? 'bg-primary' : 'bg-secondary'}
        `}
      >
        {esUsuario ? (
          <User size={18} className="text-white" />
        ) : (
          <Bot size={18} className="text-white" />
        )}
      </div>
      <div className={`flex-1 ${esUsuario ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`
            rounded-lg px-4 py-3 max-w-[80%]
            ${
              esUsuario
                ? 'bg-primary dark:bg-primary text-white'
                : 'bg-background-secondary dark:bg-background-secondary text-foreground dark:text-foreground border border-border dark:border-border'
            }
          `}
        >
          <p className="whitespace-pre-wrap break-words">{mensaje.contenido}</p>
          {mensaje.archivos_adjuntos && mensaje.archivos_adjuntos.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/20 dark:border-white/20">
              <p className="text-xs opacity-80 dark:opacity-80">
                {mensaje.archivos_adjuntos.length} archivo(s) adjunto(s)
              </p>
            </div>
          )}
        </div>
        <p className="text-xs text-foreground-muted dark:text-foreground-muted mt-1">
          {new Date(mensaje.creado_en).toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}


