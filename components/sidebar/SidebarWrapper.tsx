'use client'

import { Sidebar } from './Sidebar'
import { Perfil, Conversacion } from '@/types'

interface SidebarWrapperProps {
  perfil: Perfil
  conversaciones: Conversacion[]
}

export function SidebarWrapper({ perfil, conversaciones }: SidebarWrapperProps) {
  return <Sidebar perfil={perfil} conversaciones={conversaciones} />
}

