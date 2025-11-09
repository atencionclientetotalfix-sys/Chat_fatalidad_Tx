export enum TipoError {
  AUTENTICACION = 'AUTENTICACION',
  VALIDACION = 'VALIDACION',
  NO_ENCONTRADO = 'NO_ENCONTRADO',
  BASE_DATOS = 'BASE_DATOS',
  OPENAI = 'OPENAI',
  SERVIDOR = 'SERVIDOR',
  DESCONOCIDO = 'DESCONOCIDO',
}

export interface ErrorDetallado {
  tipo: TipoError
  mensaje: string
  codigo?: string
  detalles?: any
  timestamp: string
}

export function crearError(
  tipo: TipoError,
  mensaje: string,
  codigo?: string,
  detalles?: any
): ErrorDetallado {
  return {
    tipo,
    mensaje,
    codigo,
    detalles,
    timestamp: new Date().toISOString(),
  }
}

export function manejarError(error: unknown): ErrorDetallado {
  // Errores de Supabase
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as { code?: string; message?: string; details?: string }
    if (supabaseError.code?.startsWith('PGRST') || supabaseError.code?.startsWith('23505')) {
      return crearError(
        TipoError.BASE_DATOS,
        supabaseError.message || 'Error en la base de datos',
        supabaseError.code,
        supabaseError.details
      )
    }
  }

  // Errores de OpenAI
  if (error && typeof error === 'object' && 'status' in error) {
    const openaiError = error as { status?: number; message?: string; error?: any }
    if (openaiError.status === 401 || openaiError.status === 403) {
      return crearError(
        TipoError.OPENAI,
        'Error de autenticación con OpenAI',
        openaiError.status.toString()
      )
    }
    if (openaiError.status === 429) {
      return crearError(
        TipoError.OPENAI,
        'Límite de tasa excedido en OpenAI. Por favor espera un momento.',
        'RATE_LIMIT'
      )
    }
    if (openaiError.status === 500 || openaiError.status === 502 || openaiError.status === 503) {
      return crearError(
        TipoError.OPENAI,
        'Servicio de OpenAI temporalmente no disponible',
        openaiError.status.toString()
      )
    }
    return crearError(
      TipoError.OPENAI,
      openaiError.message || 'Error al comunicarse con OpenAI',
      openaiError.status?.toString()
    )
  }

  // Errores estándar
  if (error instanceof Error) {
    return crearError(
      TipoError.DESCONOCIDO,
      error.message,
      undefined,
      { stack: error.stack }
    )
  }

  return crearError(
    TipoError.DESCONOCIDO,
    'Error desconocido',
    undefined,
    error
  )
}

export function logError(error: ErrorDetallado, contexto?: string) {
  const logData = {
    ...error,
    contexto,
    nivel: 'error',
  }
  
  // En producción, aquí podrías enviar a un servicio de logging
  console.error('[ERROR]', JSON.stringify(logData, null, 2))
}

