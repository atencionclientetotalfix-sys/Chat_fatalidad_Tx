import { NextRequest, NextResponse } from 'next/server'
import { verificarUsuarioPermitido } from '@/lib/utils/auth-helper'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { permitido: false, mensaje: 'Email requerido' },
        { status: 400 }
      )
    }

    // Usar la función helper para verificar usuario permitido
    const verificacion = await verificarUsuarioPermitido(email)

    if (!verificacion.permitido) {
      return NextResponse.json(
        { 
          permitido: false, 
          mensaje: verificacion.mensaje || 'Email no autorizado' 
        },
        { status: 403 }
      )
    }

    return NextResponse.json({ 
      permitido: true,
      nombre: verificacion.usuario?.nombre 
    })
  } catch (error) {
    console.error('Error al verificar email:', error)
    return NextResponse.json(
      { permitido: false, mensaje: 'Error al verificar email' },
      { status: 500 }
    )
  }
}


