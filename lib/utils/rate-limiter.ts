// Rate limiter simple en memoria
// Para producción con múltiples instancias, considera usar Redis o un servicio externo

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

// Limpiar entradas expiradas cada 5 minutos (solo en servidor)
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  if (typeof setInterval !== 'undefined') {
    setInterval(() => {
      const ahora = Date.now()
      for (const [key, entry] of rateLimitMap.entries()) {
        if (entry.resetTime < ahora) {
          rateLimitMap.delete(key)
        }
      }
    }, 5 * 60 * 1000)
  }
}

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

const CONFIG_POR_RUTA: Record<string, RateLimitConfig> = {
  '/api/chat': { maxRequests: 20, windowMs: 60 * 1000 }, // 20 requests por minuto
  '/api/upload': { maxRequests: 10, windowMs: 60 * 1000 }, // 10 requests por minuto
  '/api/chat/export': { maxRequests: 5, windowMs: 60 * 1000 }, // 5 exports por minuto
}

export function verificarRateLimit(
  identificador: string,
  ruta: string
): { permitido: boolean; limiteRestante?: number; tiempoRestante?: number } {
  const config = CONFIG_POR_RUTA[ruta] || { maxRequests: 30, windowMs: 60 * 1000 }
  const ahora = Date.now()
  const entrada = rateLimitMap.get(identificador)

  if (!entrada || entrada.resetTime < ahora) {
    // Nueva ventana de tiempo
    rateLimitMap.set(identificador, {
      count: 1,
      resetTime: ahora + config.windowMs,
    })
    return {
      permitido: true,
      limiteRestante: config.maxRequests - 1,
      tiempoRestante: config.windowMs,
    }
  }

  if (entrada.count >= config.maxRequests) {
    return {
      permitido: false,
      limiteRestante: 0,
      tiempoRestante: entrada.resetTime - ahora,
    }
  }

  entrada.count++
  return {
    permitido: true,
    limiteRestante: config.maxRequests - entrada.count,
    tiempoRestante: entrada.resetTime - ahora,
  }
}

export function obtenerIdentificador(request: Request, userId?: string): string {
  // Priorizar user ID si está disponible
  if (userId) {
    return `user:${userId}`
  }
  
  // Fallback a IP
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return `ip:${ip}`
}

