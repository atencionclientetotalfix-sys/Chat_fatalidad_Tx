'use client'

import { MessageSquare } from 'lucide-react'
import { UserProfile } from './UserProfile'
import { ChatList } from './ChatList'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Conversacion, Perfil } from '@/types'

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
        // Si estamos viendo la conversación que se eliminó, redirigir al dashboard
        if (conversacionActualId === id) {
          window.location.href = '/dashboard'
        } else {
          // Solo refrescar la página para actualizar la lista sin recargar todo
          window.location.reload()
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Error al eliminar' }))
        alert(errorData.error || 'Error al eliminar la conversación')
      }
    } catch (error) {
      console.error('Error al eliminar conversación:', error)
      alert('Error al eliminar la conversación. Por favor intenta nuevamente.')
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
          <div className="px-3 py-2 rounded-lg text-sm bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary">
            <MessageSquare size={16} className="inline mr-2" />
            Control de Fatalidad TX
          </div>
        </div>
      </div>

      {/* Chat List */}
      <ChatList
        conversaciones={conversaciones}
        conversacionActualId={conversacionActualId}
        onNuevaConversacion={handleNuevaConversacion}
        onEliminarConversacion={handleEliminarConversacion}
      />

      {/* User Profile */}
      <UserProfile email={perfil.email} nombre={perfil.nombre} />
    </div>
  )
}


