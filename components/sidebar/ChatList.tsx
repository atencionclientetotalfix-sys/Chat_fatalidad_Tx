'use client'

import { MessageSquare, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Conversacion } from '@/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ChatListProps {
  conversaciones: Conversacion[]
  conversacionActualId?: string
  onNuevaConversacion: () => void
  onEliminarConversacion: (id: string) => void
}

export function ChatList({
  conversaciones,
  conversacionActualId,
  onNuevaConversacion,
  onEliminarConversacion,
}: ChatListProps) {
  const router = useRouter()
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      <div className="p-4">
        <Button
          variante="primary"
          tamaño="md"
          className="w-full"
          onClick={onNuevaConversacion}
        >
          <Plus size={20} />
          Nueva Conversación
        </Button>
      </div>

      <div className="px-2 space-y-1">
        {conversaciones.map((conversacion) => (
          <div
            key={conversacion.id}
            className={`
              group relative
              flex items-start gap-2
              px-3 py-2.5
              rounded-lg
              cursor-pointer
              transition-colors
              ${
                conversacionActualId === conversacion.id
                  ? 'bg-primary/20 dark:bg-primary/20 border border-primary/50 dark:border-primary/50'
                  : 'hover:bg-background-tertiary dark:hover:bg-background-tertiary'
              }
            `}
            onMouseEnter={() => setHoveredId(conversacion.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => router.push(`/dashboard/chat/${conversacion.id}`)}
          >
            <MessageSquare
              size={16}
              className={`
                flex-shrink-0 mt-0.5
                ${
                  conversacionActualId === conversacion.id
                    ? 'text-primary dark:text-primary'
                    : 'text-foreground-secondary dark:text-foreground-secondary'
                }
              `}
            />
            <div className="flex-1 min-w-0 flex flex-col">
              <span
                className={`
                  text-sm truncate
                  ${
                    conversacionActualId === conversacion.id
                      ? 'text-foreground dark:text-foreground font-medium'
                      : 'text-foreground-secondary dark:text-foreground-secondary'
                  }
                `}
              >
                {conversacion.titulo}
              </span>
              <span className="text-xs text-foreground-muted dark:text-foreground-muted truncate">
                {new Date(conversacion.creado_en).toLocaleString('es-CL', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEliminarConversacion(conversacion.id)
              }}
              className={`
                flex-shrink-0 p-1 rounded transition-all
                ${hoveredId === conversacion.id 
                  ? 'opacity-100 visible' 
                  : 'opacity-0 invisible'
                }
                hover:bg-red-500/20 dark:hover:bg-red-500/20
                group-hover:opacity-100 group-hover:visible
              `}
              title="Eliminar conversación"
              aria-label="Eliminar conversación"
            >
              <Trash2 size={14} className="text-red-500 dark:text-red-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}


