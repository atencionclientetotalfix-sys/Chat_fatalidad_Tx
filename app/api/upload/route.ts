import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { subirArchivo } from '@/lib/openai/assistant'
import { validarArchivo } from '@/lib/utils/file-handler'
import { manejarError, logError } from '@/lib/utils/error-handler'
import { verificarRateLimit, obtenerIdentificador } from '@/lib/utils/rate-limiter'
import { verificarAccesoUsuario } from '@/lib/utils/auth-helper'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
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
    const rateLimit = verificarRateLimit(identificador, '/api/upload')
    
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

    const formData = await request.formData()
    const archivo = formData.get('archivo') as File

    if (!archivo || !(archivo instanceof File)) {
      const error = manejarError(new Error('No se proporcionó ningún archivo válido'))
      return NextResponse.json({ error: error.mensaje }, { status: 400 })
    }

    // Validar archivo
    const validacion = validarArchivo(archivo)
    if (!validacion.valido) {
      const error = manejarError(new Error(validacion.error || 'Archivo inválido'))
      return NextResponse.json({ error: error.mensaje }, { status: 400 })
    }

    // Subir archivo a OpenAI
    let fileId: string
    try {
      fileId = await subirArchivo(archivo)
    } catch (error) {
      const errorDetallado = manejarError(error)
      logError(errorDetallado, 'Subir archivo a OpenAI')
      return NextResponse.json(
        { error: errorDetallado.mensaje },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: fileId,
      nombre: archivo.name,
      tipo: archivo.type,
      tamano: archivo.size,
    }, {
      headers: {
        'X-RateLimit-Remaining': (rateLimit.limiteRestante || 0).toString(),
      },
    })
  } catch (error) {
    const errorDetallado = manejarError(error)
    logError(errorDetallado, 'API upload POST')
    return NextResponse.json(
      { error: 'Error al subir archivo' },
      { status: 500 }
    )
  }
}

