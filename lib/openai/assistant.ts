import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID || ''

export const contextoAsistente = `Eres un asistente experto en seguridad laboral y salud ocupacional, especializado en obras de construcción eléctrica de transmisión en Chile. Tu función es ayudar a interpretar y aplicar las normas de control de riesgos de fatalidad del grupo SAESA, incluyendo:

- Interpretación de normas y procedimientos de seguridad
- Análisis de riesgos en obras eléctricas de transmisión
- Recomendaciones de medidas de control
- Asesoría en cumplimiento normativo
- Evaluación de situaciones de riesgo específicas

Responde siempre de manera profesional, clara y basada en las mejores prácticas de seguridad industrial.`

export async function crearThread() {
  const thread = await openai.beta.threads.create()
  return thread.id
}

export async function enviarMensaje(
  threadId: string,
  contenido: string,
  archivos?: string[]
) {
  if (!ASSISTANT_ID) {
    throw new Error('OPENAI_ASSISTANT_ID no está configurado. Por favor, configura esta variable de entorno.')
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY no está configurada. Por favor, configura esta variable de entorno.')
  }

  const mensaje = await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: contenido,
    ...(archivos && archivos.length > 0 && { file_ids: archivos }),
  })

  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: ASSISTANT_ID,
  })

  return { mensajeId: mensaje.id, runId: run.id }
}

export async function verificarEstadoRun(threadId: string, runId: string) {
  const run = await openai.beta.threads.runs.retrieve(threadId, runId)
  return run.status
}

export async function obtenerMensajes(threadId: string) {
  const mensajes = await openai.beta.threads.messages.list(threadId, {
    order: 'asc',
  })

  return mensajes.data
    .filter((msg) => (msg.role as string) !== 'system')
    .map((msg) => {
      // Verificar que existe contenido y que tiene al menos un elemento
      if (!msg.content || msg.content.length === 0) {
        return null
      }

      const contenido = msg.content[0]
      
      // Verificar que el contenido es de tipo texto
      if (contenido && contenido.type === 'text' && 'text' in contenido) {
        return {
          id: msg.id,
          rol: msg.role,
          contenido: contenido.text.value,
          creado_en: new Date(msg.created_at * 1000).toISOString(),
        }
      }
      
      return null
    })
    .filter((msg): msg is NonNullable<typeof msg> => msg !== null)
}

export async function subirArchivo(archivo: File): Promise<string> {
  const arrayBuffer = await archivo.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const file = await openai.files.create({
    file: buffer as any,
    purpose: 'assistants',
  })

  return file.id
}


