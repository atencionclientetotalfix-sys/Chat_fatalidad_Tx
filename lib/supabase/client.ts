import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '❌ Variables de entorno de Supabase no configuradas.\n' +
      'Por favor, crea un archivo .env.local en la raíz del proyecto con:\n' +
      'NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co\n' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui\n' +
      '\nEjecuta: npm run verificar-env para verificar todas las variables.'
    )
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}


