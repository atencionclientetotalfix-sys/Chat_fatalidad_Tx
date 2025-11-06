import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { Perfil, Conversacion } from '@/types'
import { createAdminClient } from '@/lib/supabase/admin'

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
      <div className="flex h-screen bg-base">
        <Sidebar
          perfil={perfil as Perfil}
          conversaciones={(conversaciones as Conversacion[]) || []}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error en layout:', error)
    redirect('/login')
  }
}

