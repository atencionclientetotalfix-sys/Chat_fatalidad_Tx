export const TIPOS_ARCHIVO_PERMITIDOS = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/plain',
  'text/csv',
]

export function validarArchivo(archivo: File): { valido: boolean; error?: string } {
  // Validar tipo
  if (!TIPOS_ARCHIVO_PERMITIDOS.includes(archivo.type)) {
    return {
      valido: false,
      error: `Tipo de archivo no permitido. Tipos permitidos: PDF, DOCX, imágenes, Excel, CSV, TXT`,
    }
  }

  // Validar tamaño (25MB máximo para OpenAI)
  const tamañoMaximo = 25 * 1024 * 1024 // 25MB
  if (archivo.size > tamañoMaximo) {
    return {
      valido: false,
      error: `El archivo excede el tamaño máximo permitido de 25MB`,
    }
  }

  return { valido: true }
}

export function formatearTamañoArchivo(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const tamanos = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + tamanos[i]
}


