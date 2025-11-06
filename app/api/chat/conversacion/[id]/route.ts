import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const conversacionId = params.id

    const adminSupabase = createAdminClient()

    // Verificar que la conversación pertenece al usuario
    const { data: conversacion, error: convError } = await adminSupabase
      .from('conversaciones')
      .select('*')
      .eq('id', conversacionId)
      .eq('usuario_id', session.user.id)
      .single()

    if (convError || !conversacion) {
      return NextResponse.json(
        { error: 'Conversación no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar conversación (los mensajes se eliminan en cascada)
    const { error: deleteError } = await adminSupabase
      .from('conversaciones')
      .delete()
      .eq('id', conversacionId)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Error al eliminar conversación' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar conversación:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

