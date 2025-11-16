import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { manejarError, logError } from '@/lib/utils/error-handler'
import { verificarAccesoUsuario } from '@/lib/utils/auth-helper'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const conversacionId = searchParams.get('conversacionId')

    if (!conversacionId || typeof conversacionId !== 'string') {
      const error = manejarError(new Error('ID de conversación requerido'))
      return NextResponse.json({ error: error.mensaje }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // Verificar que la conversación pertenece al usuario
    const { data: conversacion, error: convError } = await adminSupabase
      .from('conversaciones')
      .select('*')
      .eq('id', conversacionId)
      .eq('usuario_id', session.user.id)
      .single()

    if (convError || !conversacion) {
      const error = manejarError(convError || new Error('Conversación no encontrada'))
      logError(error, 'Obtener conversación en mensajes')
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
      logError(error, 'Obtener mensajes de conversación')
      return NextResponse.json({ error: 'Error al obtener mensajes' }, { status: 500 })
    }

    return NextResponse.json({ mensajes: mensajes || [] })
  } catch (error) {
    const errorDetallado = manejarError(error)
    logError(errorDetallado, 'API chat mensajes GET')
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

