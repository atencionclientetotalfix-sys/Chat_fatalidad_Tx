import { createAdminClient } from '@/lib/supabase/admin'
import { Database } from '@/types/database'

type UsuarioPermitido = Database['public']['Tables']['usuarios_permitidos']['Row']

/**
 * Verifica si un email está en la tabla de usuarios permitidos y activo
 * @param email - Email del usuario a verificar
 * @returns Objeto con permitido (boolean) y datos del usuario si está permitido
 */
export async function verificarUsuarioPermitido(email: string): Promise<{
  permitido: boolean
  usuario?: UsuarioPermitido
  mensaje?: string
}> {
  try {
    if (!email || typeof email !== 'string') {
      return {
        permitido: false,
        mensaje: 'Email inválido',
      }
    }

    const adminSupabase = createAdminClient()

    const { data: usuarioPermitido, error } = await adminSupabase
      .from('usuarios_permitidos')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('activo', true)
      .single()

    if (error || !usuarioPermitido) {
      return {
        permitido: false,
        mensaje: 'Usuario no autorizado o inactivo',
      }
    }

    return {
      permitido: true,
      usuario: usuarioPermitido,
    }
  } catch (error) {
    console.error('Error al verificar usuario permitido:', error)
    return {
      permitido: false,
      mensaje: 'Error al verificar permisos',
    }
  }
}

/**
 * Verifica si un usuario autenticado tiene acceso permitido
 * @param email - Email del usuario autenticado
 * @returns true si el usuario está permitido, false en caso contrario
 */
export async function verificarAccesoUsuario(email: string): Promise<boolean> {
  const verificacion = await verificarUsuarioPermitido(email)
  return verificacion.permitido
}


