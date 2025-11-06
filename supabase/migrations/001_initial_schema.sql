-- Tabla de usuarios (se sincroniza con auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de conversaciones
CREATE TABLE IF NOT EXISTS public.conversaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL DEFAULT 'Nueva Conversación',
  tipo_chat TEXT NOT NULL DEFAULT 'control_fatalidad_tx',
  thread_id TEXT, -- ID del thread de OpenAI
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS public.mensajes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversacion_id UUID REFERENCES public.conversaciones(id) ON DELETE CASCADE NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('user', 'assistant')),
  contenido TEXT NOT NULL,
  archivos_adjuntos JSONB DEFAULT '[]'::jsonb,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_conversaciones_usuario ON public.conversaciones(usuario_id);
CREATE INDEX idx_mensajes_conversacion ON public.mensajes(conversacion_id);
CREATE INDEX idx_conversaciones_actualizado ON public.conversaciones(actualizado_en DESC);

-- RLS (Row Level Security)
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own profile"
  ON public.perfiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.perfiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view own conversations"
  ON public.conversaciones FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create own conversations"
  ON public.conversaciones FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own conversations"
  ON public.conversaciones FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete own conversations"
  ON public.conversaciones FOR DELETE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can view own messages"
  ON public.mensajes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversaciones
      WHERE conversaciones.id = mensajes.conversacion_id
      AND conversaciones.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own messages"
  ON public.mensajes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversaciones
      WHERE conversaciones.id = mensajes.conversacion_id
      AND conversaciones.usuario_id = auth.uid()
    )
  );

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.crear_perfil_automatico()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, email, nombre)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil al registrarse
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.crear_perfil_automatico();


