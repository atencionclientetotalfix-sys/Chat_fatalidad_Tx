'use client'

import { MessageSquare, Settings } from 'lucide-react'
import { UserProfile } from './UserProfile'
import { ChatList } from './ChatList'
import { CambiarContraseña } from '@/components/auth/CambiarContraseña'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Conversacion, Perfil } from '@/types'
import { useState } from 'react'

interface SidebarProps {
  perfil: Perfil
  conversaciones: Conversacion[]
  conversacionActualId?: string
}

export function Sidebar({
  perfil,
  conversaciones,
  conversacionActualId,
}: SidebarProps) {
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false)

  const handleNuevaConversacion = () => {
    window.location.href = '/dashboard'
  }

  const handleEliminarConversacion = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta conversación?')) return

    try {
      const response = await fetch(`/api/chat/conversacion/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error al eliminar conversación:', error)
    }
  }

  return (
    <div className="w-64 h-screen bg-background-secondary dark:bg-background-secondary border-r border-border dark:border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border dark:border-border">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MessageSquare size={18} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-foreground dark:text-foreground">
              ASISTENTES HSE
            </h2>
          </div>
          <ThemeToggle />
        </div>
        <div className="space-y-1">
          <button
            onClick={() => setMostrarConfiguracion(false)}
            className={`
              w-full text-left px-3 py-2 rounded-lg text-sm
              transition-colors
              ${
                !mostrarConfiguracion
                  ? 'bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary'
                  : 'text-foreground-secondary dark:text-foreground-secondary hover:bg-background-tertiary dark:hover:bg-background-tertiary'
              }
            `}
          >
            <MessageSquare size={16} className="inline mr-2" />
            Control de Fatalidad TX
          </button>
          <button
            onClick={() => setMostrarConfiguracion(true)}
            className={`
              w-full text-left px-3 py-2 rounded-lg text-sm
              transition-colors
              ${
                mostrarConfiguracion
                  ? 'bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary'
                  : 'text-foreground-secondary dark:text-foreground-secondary hover:bg-background-tertiary dark:hover:bg-background-tertiary'
              }
            `}
          >
            <Settings size={16} className="inline mr-2" />
            Configuración
          </button>
        </div>
      </div>

      {/* Chat List */}
      {!mostrarConfiguracion && (
        <ChatList
          conversaciones={conversaciones}
          conversacionActualId={conversacionActualId}
          onNuevaConversacion={handleNuevaConversacion}
          onEliminarConversacion={handleEliminarConversacion}
        />
      )}

      {/* Configuración */}
      {mostrarConfiguracion && (
        <div className="flex-1 p-4 overflow-y-auto scrollbar-hide">
          <CambiarContraseña />
        </div>
      )}

      {/* User Profile */}
      <UserProfile email={perfil.email} nombre={perfil.nombre} />
    </div>
  )
}


