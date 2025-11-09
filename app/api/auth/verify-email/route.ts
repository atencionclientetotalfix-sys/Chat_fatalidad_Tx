import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Database } from '@/types/database'

export const runtime = 'nodejs'
export const maxDuration = 30

type UsuarioPermitido = Database['public']['Tables']['usuarios_permitidos']['Row']

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { permitido: false, mensaje: 'Email requerido' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminClient()

    // Verificar si el email está en la tabla de usuarios permitidos
    const { data: usuarioPermitido, error } = await adminSupabase
      .from('usuarios_permitidos')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('activo', true)
      .single()

    if (error || !usuarioPermitido) {
      return NextResponse.json(
        { permitido: false, mensaje: 'Email no autorizado' },
        { status: 403 }
      )
    }

    // TypeScript ahora sabe que usuarioPermitido no es null después de las validaciones
    const usuario: UsuarioPermitido = usuarioPermitido
    return NextResponse.json({ 
      permitido: true,
      nombre: usuario.nombre 
    })
  } catch (error) {
    console.error('Error al verificar email:', error)
    return NextResponse.json(
      { permitido: false, error: 'Error al verificar email' },
      { status: 500 }
    )
  }
}


