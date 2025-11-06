import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  crearThread,
  enviarMensaje,
  verificarEstadoRun,
  obtenerMensajes,
} from '@/lib/openai/assistant'
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

    const { conversacionId, mensaje, archivos } = await request.json()

    if (!conversacionId || !mensaje) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminClient()

    // Obtener conversación
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

    // Crear thread si no existe
    let threadId = conversacion.thread_id
    if (!threadId) {
      threadId = await crearThread()
      await adminSupabase
        .from('conversaciones')
        .update({ thread_id: threadId })
        .eq('id', conversacionId)
    }

    // Guardar mensaje del usuario
    const { data: mensajeUsuario, error: msgError } = await adminSupabase
      .from('mensajes')
      .insert({
        conversacion_id: conversacionId,
        rol: 'user',
        contenido: mensaje,
        archivos_adjuntos: archivos || [],
      })
      .select()
      .single()

    if (msgError) {
      return NextResponse.json(
        { error: 'Error al guardar mensaje' },
        { status: 500 }
      )
    }

    // Enviar mensaje a OpenAI
    const fileIds = archivos?.map((a: any) => a.id) || []
    const { runId } = await enviarMensaje(threadId, mensaje, fileIds)

    // Esperar respuesta (polling)
    let estado = 'queued'
    let intentos = 0
    const maxIntentos = 60

    while (estado !== 'completed' && intentos < maxIntentos) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      estado = await verificarEstadoRun(threadId, runId)
      intentos++

      if (estado === 'failed' || estado === 'cancelled') {
        return NextResponse.json(
          { error: 'Error al procesar la solicitud' },
          { status: 500 }
        )
      }
    }

    if (estado !== 'completed') {
      return NextResponse.json(
        { error: 'Timeout al esperar respuesta' },
        { status: 500 }
      )
    }

    // Obtener mensajes de OpenAI
    const mensajesOpenAI = await obtenerMensajes(threadId)
    const ultimoMensaje = mensajesOpenAI[mensajesOpenAI.length - 1]

    if (ultimoMensaje && ultimoMensaje.rol === 'assistant') {
      // Guardar respuesta del asistente
      const { data: mensajeAsistente, error: asistenteError } =
        await adminSupabase
          .from('mensajes')
          .insert({
            conversacion_id: conversacionId,
            rol: 'assistant',
            contenido: ultimoMensaje.contenido,
            archivos_adjuntos: [],
          })
          .select()
          .single()

      if (asistenteError) {
        console.error('Error al guardar respuesta:', asistenteError)
      }

      // Actualizar fecha de actualización de conversación
      await adminSupabase
        .from('conversaciones')
        .update({ actualizado_en: new Date().toISOString() })
        .eq('id', conversacionId)

      return NextResponse.json({
        mensajeUsuario,
        mensajeAsistente,
      })
    }

    return NextResponse.json({ error: 'No se recibió respuesta' }, { status: 500 })
  } catch (error) {
    console.error('Error en API chat:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

