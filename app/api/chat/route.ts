import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  crearThread,
  enviarMensaje,
  verificarEstadoRun,
  obtenerMensajes,
} from '@/lib/openai/assistant'
import { createAdminClient } from '@/lib/supabase/admin'
import { manejarError, logError, TipoError } from '@/lib/utils/error-handler'
import { verificarRateLimit, obtenerIdentificador } from '@/lib/utils/rate-limiter'
import { verificarAccesoUsuario } from '@/lib/utils/auth-helper'
import { Database } from '@/types/database'

type Conversacion = Database['public']['Tables']['conversaciones']['Row']
type ConversacionUpdate = Database['public']['Tables']['conversaciones']['Update']

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 120

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

    // Rate limiting
    const identificador = obtenerIdentificador(request, session.user.id)
    const rateLimit = verificarRateLimit(identificador, '/api/chat')
    
    if (!rateLimit.permitido) {
      return NextResponse.json(
        {
          error: 'Demasiadas solicitudes. Por favor espera un momento.',
          tiempoRestante: Math.ceil((rateLimit.tiempoRestante || 0) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.tiempoRestante || 0) / 1000).toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + (rateLimit.tiempoRestante || 0)).toISOString(),
          },
        }
      )
    }

    const { conversacionId, mensaje, archivos } = await request.json()

    // Validación mejorada
    if (!conversacionId || typeof conversacionId !== 'string') {
      const error = manejarError(new Error('ID de conversación inválido'))
      return NextResponse.json({ error: error.mensaje }, { status: 400 })
    }

    if (!mensaje || typeof mensaje !== 'string' || mensaje.trim().length === 0) {
      const error = manejarError(new Error('El mensaje no puede estar vacío'))
      return NextResponse.json({ error: error.mensaje }, { status: 400 })
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
      const error = manejarError(convError || new Error('Conversación no encontrada'))
      logError(error, 'Obtener conversación')
      return NextResponse.json({ error: error.mensaje }, { status: 404 })
    }

    // TypeScript type assertion
    const conversacionTipada: Conversacion = conversacion

    // Crear thread si no existe
    let threadId: string | null = conversacionTipada.thread_id
    if (!threadId) {
      try {
        threadId = await crearThread()
        const { error: updateError } = await adminSupabase
          .from('conversaciones')
          // @ts-expect-error - Supabase type inference issue
          .update({ thread_id: threadId })
          .eq('id', conversacionTipada.id)

        if (updateError) {
          const error = manejarError(updateError)
          logError(error, 'Actualizar thread_id')
        }
      } catch (error) {
        const errorDetallado = manejarError(error)
        logError(errorDetallado, 'Crear thread')
        return NextResponse.json(
          { error: 'Error al crear thread de conversación' },
          { status: 500 }
        )
      }
    }

    // Guardar mensaje del usuario
    const { data: mensajeUsuario, error: msgError } = await adminSupabase
      .from('mensajes')
      // @ts-expect-error - Supabase type inference issue
      .insert({
        conversacion_id: conversacionId,
        rol: 'user',
        contenido: mensaje.trim(),
        archivos_adjuntos: archivos || [],
      })
      .select()
      .single()

    if (msgError) {
      const error = manejarError(msgError)
      logError(error, 'Guardar mensaje usuario')
      return NextResponse.json({ error: 'Error al guardar mensaje' }, { status: 500 })
    }

    // Enviar mensaje a OpenAI
    const fileIds = archivos?.map((a: any) => a.id).filter(Boolean) || []
    
    let runId: string
    try {
      const resultado = await enviarMensaje(threadId, mensaje.trim(), fileIds)
      runId = resultado.runId
    } catch (error) {
      const errorDetallado = manejarError(error)
      logError(errorDetallado, 'Enviar mensaje a OpenAI')
      return NextResponse.json(
        { error: errorDetallado.mensaje },
        { status: 500 }
      )
    }

    // Esperar respuesta (polling)
    let estado = 'queued'
    let intentos = 0
    const maxIntentos = 120 // 2 minutos máximo

    while (estado !== 'completed' && intentos < maxIntentos) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      try {
        estado = await verificarEstadoRun(threadId, runId)
      } catch (error) {
        const errorDetallado = manejarError(error)
        logError(errorDetallado, 'Verificar estado run')
        // Continuar intentando en caso de error temporal
      }
      
      intentos++

      if (estado === 'failed' || estado === 'cancelled') {
        const error = manejarError(new Error(`Run ${estado}`))
        return NextResponse.json(
          { error: 'Error al procesar la solicitud' },
          { status: 500 }
        )
      }
    }

    if (estado !== 'completed') {
      return NextResponse.json(
        { error: 'Timeout al esperar respuesta. Por favor intenta nuevamente.' },
        { status: 504 }
      )
    }

    // Obtener mensajes de OpenAI
    let mensajesOpenAI
    try {
      mensajesOpenAI = await obtenerMensajes(threadId)
    } catch (error) {
      const errorDetallado = manejarError(error)
      logError(errorDetallado, 'Obtener mensajes de OpenAI')
      return NextResponse.json(
        { error: 'Error al obtener respuesta' },
        { status: 500 }
      )
    }
    
    const ultimoMensaje = mensajesOpenAI[mensajesOpenAI.length - 1]

    if (ultimoMensaje && ultimoMensaje.rol === 'assistant') {
      // Guardar respuesta del asistente
      const { data: mensajeAsistente, error: asistenteError } =
        await adminSupabase
          .from('mensajes')
          // @ts-expect-error - Supabase type inference issue
          .insert({
            conversacion_id: conversacionId,
            rol: 'assistant',
            contenido: ultimoMensaje.contenido,
            archivos_adjuntos: [],
          })
          .select()
          .single()

      if (asistenteError) {
        const error = manejarError(asistenteError)
        logError(error, 'Guardar respuesta asistente')
        // No fallar la request, solo loguear el error
      }

      // Actualizar fecha de actualización de conversación
      await adminSupabase
        .from('conversaciones')
        // @ts-expect-error - Supabase type inference issue
        .update({ actualizado_en: new Date().toISOString() })
        .eq('id', conversacionId)

      return NextResponse.json({
        mensajeUsuario,
        mensajeAsistente,
      }, {
        headers: {
          'X-RateLimit-Remaining': (rateLimit.limiteRestante || 0).toString(),
          'X-RateLimit-Reset': new Date(Date.now() + (rateLimit.tiempoRestante || 0)).toISOString(),
        },
      })
    }

    return NextResponse.json(
      { error: 'No se recibió respuesta del asistente' },
      { status: 500 }
    )
  } catch (error) {
    const errorDetallado = manejarError(error)
    logError(errorDetallado, 'API chat POST')
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

