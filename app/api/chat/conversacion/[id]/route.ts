import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { manejarError, logError } from '@/lib/utils/error-handler'
import { verificarAccesoUsuario } from '@/lib/utils/auth-helper'

export const runtime = 'nodejs'
export const maxDuration = 30

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

    const conversacionId = params.id

    if (!conversacionId || typeof conversacionId !== 'string') {
      const error = manejarError(new Error('ID de conversación inválido'))
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
      logError(error, 'Verificar conversación antes de eliminar')
      return NextResponse.json({ error: error.mensaje }, { status: 404 })
    }

    // Eliminar conversación (los mensajes se eliminan en cascada)
    const { error: deleteError } = await adminSupabase
      .from('conversaciones')
      .delete()
      .eq('id', conversacionId)

    if (deleteError) {
      const error = manejarError(deleteError)
      logError(error, 'Eliminar conversación')
      return NextResponse.json(
        { error: 'Error al eliminar conversación' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorDetallado = manejarError(error)
    logError(errorDetallado, 'API chat conversacion DELETE')
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

