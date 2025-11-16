import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exportarConversacionAPDF } from '@/lib/utils/pdf-export'
import { manejarError, logError } from '@/lib/utils/error-handler'
import { verificarRateLimit, obtenerIdentificador } from '@/lib/utils/rate-limiter'
import { verificarAccesoUsuario } from '@/lib/utils/auth-helper'

export const runtime = 'nodejs'
export const maxDuration = 60

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
    const rateLimit = verificarRateLimit(identificador, '/api/chat/export')
    
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
          },
        }
      )
    }

    const { conversacionId } = await request.json()

    if (!conversacionId || typeof conversacionId !== 'string') {
      const error = manejarError(new Error('ID de conversación requerido'))
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
      logError(error, 'Obtener conversación para export')
      return NextResponse.json({ error: error.mensaje }, { status: 404 })
    }

    // Obtener mensajes
    const { data: mensajes, error: msgError } = await adminSupabase
      .from('mensajes')
      .select('*')
      .eq('conversacion_id', conversacionId)
      .order('creado_en', { ascending: true })

    if (msgError) {
      const error = manejarError(msgError)
      logError(error, 'Obtener mensajes para export')
      return NextResponse.json(
        { error: 'Error al obtener mensajes' },
        { status: 500 }
      )
    }

    // Generar PDF
    let arrayBuffer: ArrayBuffer
    try {
      const doc = exportarConversacionAPDF(conversacion, mensajes || [])
      const pdfBlob = doc.output('blob')
      arrayBuffer = await pdfBlob.arrayBuffer()
    } catch (error) {
      const errorDetallado = manejarError(error)
      logError(errorDetallado, 'Generar PDF')
      return NextResponse.json(
        { error: 'Error al generar el PDF' },
        { status: 500 }
      )
    }

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="conversacion-${conversacionId}.pdf"`,
        'X-RateLimit-Remaining': (rateLimit.limiteRestante || 0).toString(),
      },
    })
  } catch (error) {
    const errorDetallado = manejarError(error)
    logError(errorDetallado, 'API chat export POST')
    return NextResponse.json(
      { error: 'Error al exportar conversación' },
      { status: 500 }
    )
  }
}

