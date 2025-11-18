import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SidebarWrapper } from '@/components/sidebar/SidebarWrapper'
import { Perfil, Conversacion } from '@/types'
import { createAdminClient } from '@/lib/supabase/admin'
import { verificarAccesoUsuario } from '@/lib/utils/auth-helper'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Dashboard - ASISTENTES HSE PROFESIONAL',
  description: 'Panel de control del asistente conversacional',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Verificar que el usuario esté en la tabla de usuarios permitidos
  const emailUsuario = session.user.email
  if (!emailUsuario) {
    redirect('/login?error=email_no_disponible')
  }

  const tieneAcceso = await verificarAccesoUsuario(emailUsuario)
  if (!tieneAcceso) {
    // Usuario no permitido, cerrar sesión y redirigir
    await supabase.auth.signOut()
    redirect('/login?error=no_autorizado')
  }

  try {
    // Obtener perfil
    const adminSupabase = createAdminClient()
    const { data: perfil } = await adminSupabase
      .from('perfiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    // Obtener conversaciones
    const { data: conversaciones } = await adminSupabase
      .from('conversaciones')
      .select('*')
      .eq('usuario_id', session.user.id)
      .order('actualizado_en', { ascending: false })

    if (!perfil) {
      redirect('/login')
    }

    return (
      <div className="flex h-screen bg-base dark:bg-base">
        <SidebarWrapper
          perfil={perfil as Perfil}
          conversaciones={(conversaciones as Conversacion[]) || []}
        />
        <main className="flex-1 flex flex-col overflow-hidden bg-base dark:bg-base">
          {children}
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error en layout:', error)
    redirect('/login')
  }
}

