import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { crearThread } from '@/lib/openai/assistant'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { titulo, tipoChat } = await request.json()

    // Crear thread en OpenAI
    const threadId = await crearThread()

    // Crear conversación en Supabase
    const adminSupabase = createAdminClient()
    const { data: conversacion, error } = await adminSupabase
      .from('conversaciones')
      .insert({
        usuario_id: session.user.id,
        titulo: titulo || 'Nueva Conversación',
        tipo_chat: tipoChat || 'control_fatalidad_tx',
        thread_id: threadId,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Error al crear conversación' },
        { status: 500 }
      )
    }

    return NextResponse.json({ conversacion })
  } catch (error) {
    console.error('Error al crear thread:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

