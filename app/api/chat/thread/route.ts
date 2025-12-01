import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { crearThread } from '@/lib/openai/assistant'
import { createAdminClient } from '@/lib/supabase/admin'
import { manejarError, logError } from '@/lib/utils/error-handler'
import { verificarAccesoUsuario } from '@/lib/utils/auth-helper'
import { Database } from '@/types/database'

type ConversacionInsert = Database['public']['Tables']['conversaciones']['Insert']

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

    // Verificar variables de entorno de OpenAI
    if (!process.env.OPENAI_API_KEY) {
      const error = manejarError(new Error('OPENAI_API_KEY no está configurada'))
      logError(error, 'Verificar variables de entorno')
      return NextResponse.json(
        { error: 'Error de configuración: OPENAI_API_KEY no está configurada' },
        { status: 500 }
      )
    }

    // Crear thread en OpenAI
    let threadId: string
    try {
      threadId = await crearThread()
    } catch (error) {
      const errorDetallado = manejarError(error)
      logError(errorDetallado, 'Crear thread en OpenAI')
      const mensajeError = errorDetallado.mensaje || 'Error desconocido al crear thread'
      console.error('Error detallado al crear thread:', errorDetallado)
      return NextResponse.json(
        { 
          error: 'Error al crear thread de conversación',
          detalle: mensajeError 
        },
        { status: 500 }
      )
    }

    // Verificar variables de entorno de Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const error = manejarError(new Error('NEXT_PUBLIC_SUPABASE_URL no está configurada'))
      logError(error, 'Verificar variables de entorno Supabase')
      return NextResponse.json(
        { error: 'Error de configuración: NEXT_PUBLIC_SUPABASE_URL no está configurada' },
        { status: 500 }
      )
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const error = manejarError(new Error('SUPABASE_SERVICE_ROLE_KEY no está configurada'))
      logError(error, 'Verificar variables de entorno Supabase')
      return NextResponse.json(
        { error: 'Error de configuración: SUPABASE_SERVICE_ROLE_KEY no está configurada' },
        { status: 500 }
      )
    }

    // Crear conversación en Supabase
    let adminSupabase
    try {
      adminSupabase = createAdminClient()
    } catch (error) {
      const errorDetallado = manejarError(error)
      logError(errorDetallado, 'Crear cliente admin de Supabase')
      return NextResponse.json(
        { 
          error: 'Error de configuración de Supabase',
          detalle: errorDetallado.mensaje 
        },
        { status: 500 }
      )
    }
    const datosConversacion: ConversacionInsert = {
      usuario_id: session.user.id,
      titulo: tituloFinal,
      tipo_chat: tipoChatFinal,
      thread_id: threadId,
    }

    const { data: conversacion, error } = await adminSupabase
      .from('conversaciones')
      .insert(datosConversacion)
      .select()
      .single()

    if (error) {
      const errorDetallado = manejarError(error)
      logError(errorDetallado, 'Crear conversación en Supabase')
      console.error('Error detallado al crear conversación:', errorDetallado)
      console.error('Error de Supabase:', error)
      return NextResponse.json(
        { 
          error: 'Error al crear conversación en la base de datos',
          detalle: errorDetallado.mensaje || error.message || 'Error desconocido'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ conversacion })
  } catch (error) {
    const errorDetallado = manejarError(error)
    logError(errorDetallado, 'API chat thread POST')
    console.error('Error inesperado en API chat thread:', errorDetallado)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        detalle: errorDetallado.mensaje || 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

