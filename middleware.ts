import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { verificarAccesoUsuario } from '@/lib/utils/auth-helper'

export async function middleware(request: NextRequest) {
  // Permitir que las rutas de recuperación de contraseña pasen sin verificación
  const pathname = request.nextUrl.pathname
  if (
    pathname === '/recuperar-contraseña' ||
    pathname === '/restablecer-contraseña' ||
    pathname.startsWith('/restablecer-contraseña')
  ) {
    return NextResponse.next()
  }

  // Verificar que las variables de entorno estén disponibles
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Si estamos en desarrollo, permitir continuar pero mostrar advertencia
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Variables de entorno de Supabase no configuradas')
      return NextResponse.next()
    }
    // En producción, redirigir a una página de error o login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

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
  if (request.nextUrl.pathname.startsWith('/dashboard') || 
      request.nextUrl.pathname.startsWith('/chat')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verificar que el usuario esté en la tabla de usuarios permitidos
    const emailUsuario = session.user.email
    if (emailUsuario) {
      const tieneAcceso = await verificarAccesoUsuario(emailUsuario)
      if (!tieneAcceso) {
        // Usuario no permitido, cerrar sesión y redirigir
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/login?error=no_autorizado', request.url))
      }
    }
  }

  // Redirigir a dashboard si ya está autenticado y trata de acceder al login
  if (request.nextUrl.pathname === '/login' && session) {
    // Verificar también en login para evitar redirecciones innecesarias
    const emailUsuario = session.user.email
    if (emailUsuario) {
      const tieneAcceso = await verificarAccesoUsuario(emailUsuario)
      if (tieneAcceso) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } else {
        // Usuario no permitido, cerrar sesión
        await supabase.auth.signOut()
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

