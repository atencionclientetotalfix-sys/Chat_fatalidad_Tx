export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      perfiles: {
        Row: {
          id: string
          email: string
          nombre: string | null
          creado_en: string
          actualizado_en: string
        }
        Insert: {
          id: string
          email: string
          nombre?: string | null
          creado_en?: string
          actualizado_en?: string
        }
        Update: {
          id?: string
          email?: string
          nombre?: string | null
          creado_en?: string
          actualizado_en?: string
        }
      }
      conversaciones: {
        Row: {
          id: string
          usuario_id: string
          titulo: string
          tipo_chat: string
          thread_id: string | null
          creado_en: string
          actualizado_en: string
        }
        Insert: {
          id?: string
          usuario_id: string
          titulo?: string
          tipo_chat?: string
          thread_id?: string | null
          creado_en?: string
          actualizado_en?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          titulo?: string
          tipo_chat?: string
          thread_id?: string | null
          creado_en?: string
          actualizado_en?: string
        }
      }
      mensajes: {
        Row: {
          id: string
          conversacion_id: string
          rol: 'user' | 'assistant'
          contenido: string
          archivos_adjuntos: Json
          creado_en: string
        }
        Insert: {
          id?: string
          conversacion_id: string
          rol: 'user' | 'assistant'
          contenido: string
          archivos_adjuntos?: Json
          creado_en?: string
        }
        Update: {
          id?: string
          conversacion_id?: string
          rol?: 'user' | 'assistant'
          contenido?: string
          archivos_adjuntos?: Json
          creado_en?: string
        }
      }
      usuarios_permitidos: {
        Row: {
          id: string
          email: string
          nombre: string | null
          activo: boolean
          creado_en: string
          actualizado_en: string
        }
        Insert: {
          id?: string
          email: string
          nombre?: string | null
          activo?: boolean
          creado_en?: string
          actualizado_en?: string
        }
        Update: {
          id?: string
          email?: string
          nombre?: string | null
          activo?: boolean
          creado_en?: string
          actualizado_en?: string
        }
      }
    }
  }
}


