import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { subirArchivo } from '@/lib/openai/assistant'
import { validarArchivo } from '@/lib/utils/file-handler'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const archivo = formData.get('archivo') as File

    if (!archivo) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    // Validar archivo
    const validacion = validarArchivo(archivo)
    if (!validacion.valido) {
      return NextResponse.json(
        { error: validacion.error },
        { status: 400 }
      )
    }

    // Subir archivo a OpenAI
    const fileId = await subirArchivo(archivo)

    return NextResponse.json({
      id: fileId,
      nombre: archivo.name,
      tipo: archivo.type,
      tamano: archivo.size,
    })
  } catch (error) {
    console.error('Error al subir archivo:', error)
    return NextResponse.json(
      { error: 'Error al subir archivo' },
      { status: 500 }
    )
  }
}

