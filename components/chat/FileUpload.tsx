'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, File, AlertCircle } from 'lucide-react'
import { validarArchivo, formatearTamañoArchivo } from '@/lib/utils/file-handler'
import { ArchivoAdjunto } from '@/types'

interface FileUploadProps {
  archivos: ArchivoAdjunto[]
  onArchivosChange: (archivos: ArchivoAdjunto[]) => void
  onSubirArchivo: (archivo: File) => Promise<string>
}

export function FileUpload({
  archivos,
  onArchivosChange,
  onSubirArchivo,
}: FileUploadProps) {
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (archivosAceptados: File[]) => {
      setError(null)
      setSubiendo(true)

      for (const archivo of archivosAceptados) {
        const validacion = validarArchivo(archivo)
        if (!validacion.valido) {
          setError(validacion.error || 'Error al validar archivo')
          setSubiendo(false)
          return
        }

        try {
          const fileId = await onSubirArchivo(archivo)
          const nuevoArchivo: ArchivoAdjunto = {
            id: fileId,
            nombre: archivo.name,
            tipo: archivo.type,
            url: '',
            tamano: archivo.size,
          }
          onArchivosChange([...archivos, nuevoArchivo])
        } catch (err) {
          setError('Error al subir archivo. Intenta nuevamente.')
          console.error(err)
        }
      }

      setSubiendo(false)
    },
    [archivos, onArchivosChange, onSubirArchivo]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: subiendo,
    multiple: true,
  })

  const eliminarArchivo = (id: string) => {
    onArchivosChange(archivos.filter((archivo) => archivo.id !== id))
  }

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-4
          cursor-pointer transition-colors
          ${
            isDragActive
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          }
          ${subiendo ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2 text-center">
          <Upload
            size={24}
            className={isDragActive ? 'text-primary' : 'text-foreground-secondary'}
          />
          <p className="text-sm text-foreground-secondary">
            {isDragActive
              ? 'Suelta los archivos aquí'
              : 'Arrastra archivos aquí o haz clic para seleccionar'}
          </p>
          <p className="text-xs text-foreground-muted">
            PDF, DOCX, imágenes, Excel (máx. 25MB)
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {archivos.length > 0 && (
        <div className="space-y-2">
          {archivos.map((archivo) => (
            <div
              key={archivo.id}
              className="flex items-center gap-2 p-2 bg-background-secondary rounded-lg"
            >
              <File size={16} className="text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{archivo.nombre}</p>
                <p className="text-xs text-foreground-secondary">
                  {formatearTamañoArchivo(archivo.tamano)}
                </p>
              </div>
              <button
                onClick={() => eliminarArchivo(archivo.id)}
                className="flex-shrink-0 hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


