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
              flex items-center gap-2
              px-3 py-2
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
            onClick={() => router.push(`/chat/${conversacion.id}`)}
          >
            <MessageSquare
              size={16}
              className={`
                flex-shrink-0
                ${
                  conversacionActualId === conversacion.id
                    ? 'text-primary dark:text-primary'
                    : 'text-foreground-secondary dark:text-foreground-secondary'
                }
              `}
            />
            <span
              className={`
                flex-1 text-sm truncate
                ${
                  conversacionActualId === conversacion.id
                    ? 'text-foreground dark:text-foreground font-medium'
                    : 'text-foreground-secondary dark:text-foreground-secondary'
                }
              `}
            >
              {conversacion.titulo}
            </span>
            {hoveredId === conversacion.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEliminarConversacion(conversacion.id)
                }}
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} className="text-red-500" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}


