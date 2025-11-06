export interface Perfil {
  id: string;
  email: string;
  nombre: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface Conversacion {
  id: string;
  usuario_id: string;
  titulo: string;
  tipo_chat: string;
  thread_id: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface Mensaje {
  id: string;
  conversacion_id: string;
  rol: 'user' | 'assistant';
  contenido: string;
  archivos_adjuntos: ArchivoAdjunto[];
  creado_en: string;
}

export interface ArchivoAdjunto {
  id: string;
  nombre: string;
  tipo: string;
  url: string;
  tamano: number;
}

export interface ChatEstado {
  conversacionActual: Conversacion | null;
  mensajes: Mensaje[];
  cargando: boolean;
  error: string | null;
}


