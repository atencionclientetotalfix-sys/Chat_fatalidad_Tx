import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exportarConversacionAPDF } from '@/lib/utils/pdf-export'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { conversacionId } = await request.json()

    if (!conversacionId) {
      return NextResponse.json(
        { error: 'Falta el ID de conversación' },
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

    // Obtener mensajes
    const { data: mensajes, error: msgError } = await adminSupabase
      .from('mensajes')
      .select('*')
      .eq('conversacion_id', conversacionId)
      .order('creado_en', { ascending: true })

    if (msgError) {
      return NextResponse.json(
        { error: 'Error al obtener mensajes' },
        { status: 500 }
      )
    }

    // Generar PDF
    const doc = exportarConversacionAPDF(conversacion, mensajes || [])
    const pdfBlob = doc.output('blob')
    const arrayBuffer = await pdfBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="conversacion-${conversacionId}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error al exportar conversación:', error)
    return NextResponse.json(
      { error: 'Error al exportar conversación' },
      { status: 500 }
    )
  }
}

