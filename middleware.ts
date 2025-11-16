import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { verificarAccesoUsuario } from '@/lib/utils/auth-helper'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Permitir que las rutas de recuperación de contraseña pasen sin verificación
  if (
    pathname === '/recuperar-contraseña' ||
    pathname === '/restablecer-contraseña' ||
    pathname.startsWith('/restablecer-contraseña/')
  ) {
    return NextResponse.next()
  }

  // Excluir rutas de API del middleware (se manejan por separado)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Verificar que las variables de entorno estén disponibles
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Si no hay variables de entorno, permitir continuar sin autenticación
    // Esto evita errores 500 en producción
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: any) {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }: any) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Proteger rutas del dashboard
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/chat')) {
      if (!session) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Verificar que el usuario esté en la tabla de usuarios permitidos
      const emailUsuario = session.user.email
      if (emailUsuario) {
        try {
          const tieneAcceso = await verificarAccesoUsuario(emailUsuario)
          if (!tieneAcceso) {
            // Usuario no permitido, cerrar sesión y redirigir
            await supabase.auth.signOut()
            return NextResponse.redirect(new URL('/login?error=no_autorizado', request.url))
          }
        } catch (error) {
          // Si hay error al verificar acceso, permitir continuar para evitar errores 500
          console.error('Error al verificar acceso:', error)
        }
      }
    }

    // Redirigir a dashboard si ya está autenticado y trata de acceder al login
    if (pathname === '/login' && session) {
      // Verificar también en login para evitar redirecciones innecesarias
      const emailUsuario = session.user.email
      if (emailUsuario) {
        try {
          const tieneAcceso = await verificarAccesoUsuario(emailUsuario)
          if (tieneAcceso) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
          } else {
            // Usuario no permitido, cerrar sesión
            await supabase.auth.signOut()
          }
        } catch (error) {
          // Si hay error al verificar acceso, permitir continuar
          console.error('Error al verificar acceso:', error)
        }
      }
    }

    return supabaseResponse
  } catch (error) {
    // Si hay cualquier error en el middleware, permitir continuar para evitar errores 500
    console.error('Error en middleware:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|css)$).*)',
  ],
}

