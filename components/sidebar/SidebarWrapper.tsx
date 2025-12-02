'use client'

import { Sidebar } from './Sidebar'
import { Perfil, Conversacion } from '@/types'
import { usePathname } from 'next/navigation'

interface SidebarWrapperProps {
  perfil: Perfil
  conversaciones: Conversacion[]
}

export function SidebarWrapper({ perfil, conversaciones }: SidebarWrapperProps) {
  const pathname = usePathname()
  
  // Extraer el chatId de la URL si estamos en una página de chat
  const chatIdMatch = pathname?.match(/\/chat\/([^/]+)/)
  const conversacionActualId = chatIdMatch ? chatIdMatch[1] : undefined

  return (
    <Sidebar 
      perfil={perfil} 
      conversaciones={conversaciones}
      conversacionActualId={conversacionActualId}
    />
  )
}

