import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { crearThread } from '@/lib/openai/assistant'
import { createAdminClient } from '@/lib/supabase/admin'
import { manejarError, logError } from '@/lib/utils/error-handler'
import { verificarAccesoUsuario } from '@/lib/utils/auth-helper'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      const error = manejarError(new Error('No autorizado'))
      return NextResponse.json({ error: error.mensaje }, { status: 401 })
    }

    // Verificar que el usuario esté en la tabla de usuarios permitidos
    const emailUsuario = session.user.email
    if (!emailUsuario) {
      const error = manejarError(new Error('Email no disponible'))
      return NextResponse.json({ error: error.mensaje }, { status: 401 })
    }

    const tieneAcceso = await verificarAccesoUsuario(emailUsuario)
    if (!tieneAcceso) {
      const error = manejarError(new Error('Usuario no autorizado'))
      return NextResponse.json({ error: error.mensaje }, { status: 403 })
    }

    const { titulo, tipoChat } = await request.json()

    // Validación
    const tituloFinal = titulo && typeof titulo === 'string' && titulo.trim() 
      ? titulo.trim() 
      : 'Nueva Conversación'
    
    const tipoChatFinal = tipoChat && typeof tipoChat === 'string'
      ? tipoChat
      : 'control_fatalidad_tx'

    // Crear thread en OpenAI
    let threadId: string
    try {
      threadId = await crearThread()
    } catch (error) {
      const errorDetallado = manejarError(error)
      logError(errorDetallado, 'Crear thread en OpenAI')
      return NextResponse.json(
        { error: 'Error al crear thread de conversación' },
        { status: 500 }
      )
    }

    // Crear conversación en Supabase
    const adminSupabase = createAdminClient()
    const { data: conversacion, error } = await adminSupabase
      .from('conversaciones')
      // @ts-expect-error - Supabase type inference issue
      .insert({
        usuario_id: session.user.id,
        titulo: tituloFinal,
        tipo_chat: tipoChatFinal,
        thread_id: threadId,
      })
      .select()
      .single()

    if (error) {
      const errorDetallado = manejarError(error)
      logError(errorDetallado, 'Crear conversación en Supabase')
      return NextResponse.json(
        { error: 'Error al crear conversación' },
        { status: 500 }
      )
    }

    return NextResponse.json({ conversacion })
  } catch (error) {
    const errorDetallado = manejarError(error)
    logError(errorDetallado, 'API chat thread POST')
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

