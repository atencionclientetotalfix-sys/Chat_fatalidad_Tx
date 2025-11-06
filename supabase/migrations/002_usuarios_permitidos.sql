-- Tabla para almacenar emails permitidos
CREATE TABLE IF NOT EXISTS public.usuarios_permitidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT,
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_usuarios_permitidos_email ON public.usuarios_permitidos(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_permitidos_activo ON public.usuarios_permitidos(activo);

-- RLS (Row Level Security)
ALTER TABLE public.usuarios_permitidos ENABLE ROW LEVEL SECURITY;

-- Política: Permitir acceso solo desde service role (backend)
-- En producción, esto debería ser más restrictivo
CREATE POLICY "Service role can manage allowed users"
  ON public.usuarios_permitidos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insertar usuario inicial (Fernando Etchegaray)
INSERT INTO public.usuarios_permitidos (email, nombre, activo)
VALUES 
  ('fernando.etchegaray@qualivita.cl', 'Fernando Etchegaray', true)
ON CONFLICT (email) DO NOTHING;

-- NOTA: Para agregar el segundo usuario, ejecuta este comando en Supabase SQL Editor:
-- INSERT INTO public.usuarios_permitidos (email, nombre, activo)
-- VALUES ('SEGUNDO_EMAIL_AQUI@correo.com', 'Nombre Segundo Usuario', true)
-- ON CONFLICT (email) DO NOTHING;

