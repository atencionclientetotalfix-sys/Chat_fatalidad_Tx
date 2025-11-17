# 🔐 Configuración de Recuperación de Contraseña

Esta guía explica cómo configurar correctamente Supabase para que funcione el sistema de recuperación de contraseña.

## ⚠️ PROBLEMA COMÚN: Página en Blanco

Si al hacer clic en el enlace del email de recuperación la página queda en blanco, **es porque falta configurar las URLs de redirección en Supabase**.

## 📋 Paso 1: Configurar URLs de Redirección en Supabase

### 1.1 Acceder a la Configuración

1. Ve al [Dashboard de Supabase](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Authentication** → **URL Configuration** (en el menú lateral izquierdo)

### 1.2 Agregar URLs Permitidas

En la sección **"Redirect URLs"**, agrega las siguientes URLs (una por línea):

**Para Desarrollo (Local):**
```
http://localhost:3000/restablecer-contraseña
http://localhost:3000/
```

**Para Producción:**
```
https://tu-dominio.vercel.app/restablecer-contraseña
https://tu-dominio.vercel.app/
```

**Ejemplo completo:**
```
http://localhost:3000/restablecer-contraseña
http://localhost:3000/
https://chat-fernando.vercel.app/restablecer-contraseña
https://chat-fernando.vercel.app/
```

### 1.3 Guardar Cambios

- Haz clic en **"Save"** o **"Guardar"**
- Los cambios se aplican inmediatamente

## 📋 Paso 2: Verificar Variables de Entorno

### 2.1 En Desarrollo (`.env.local`)

Asegúrate de tener:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2.2 En Producción (Vercel)

Ve a **Vercel Dashboard** → **Settings** → **Environment Variables** y verifica:

- ✅ `NEXT_PUBLIC_SUPABASE_URL` está configurada
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` está configurada
- ✅ `NEXT_PUBLIC_APP_URL` está configurada con la URL de producción (ej: `https://tu-dominio.vercel.app`)

**⚠️ IMPORTANTE:** Todas las variables deben estar marcadas para:
- ✅ Production
- ✅ Preview
- ✅ Development

## 🔄 Flujo de Recuperación de Contraseña

1. **Usuario solicita recuperación:**
   - Va a `/recuperar-contraseña`
   - Ingresa su email
   - El sistema envía un email con un enlace

2. **Usuario hace clic en el email:**
   - Supabase redirige a la URL configurada con un código: `?code=abc123...`
   - La página `/restablecer-contraseña` recibe el código
   - El código se intercambia por una sesión

3. **Usuario restablece contraseña:**
   - Ingresa nueva contraseña
   - Confirma contraseña
   - Se actualiza la contraseña
   - Redirige al login

## 🐛 Solución de Problemas

### Problema: Página queda en blanco al hacer clic en el email

**Causa:** La URL de redirección no está configurada en Supabase.

**Solución:**
1. Ve a Supabase → Authentication → URL Configuration
2. Agrega la URL exacta (con protocolo, dominio y ruta completa)
3. Guarda los cambios
4. Prueba nuevamente

### Problema: Error "Invalid redirect URL"

**Causa:** La URL en el código no coincide con las URLs permitidas en Supabase.

**Solución:**
1. Verifica que `NEXT_PUBLIC_APP_URL` esté configurada correctamente
2. Verifica que la URL en Supabase coincida exactamente (incluyendo `http://` o `https://`)
3. No uses trailing slash inconsistente

### Problema: El código no se encuentra

**Causa:** El código puede venir en diferentes formatos (query params o hash).

**Solución:** Ya está implementado en el código - la página maneja ambos casos automáticamente.

## ✅ Checklist de Verificación

- [ ] URLs de redirección agregadas en Supabase (desarrollo y producción)
- [ ] `NEXT_PUBLIC_APP_URL` configurada en `.env.local` (desarrollo)
- [ ] `NEXT_PUBLIC_APP_URL` configurada en Vercel (producción)
- [ ] Probar flujo completo: solicitar → email → restablecer
- [ ] Verificar que no haya errores en la consola del navegador

## 📝 Notas Importantes

1. **Las URLs deben coincidir exactamente:** Si tu app está en `https://app.example.com`, la URL en Supabase debe ser exactamente `https://app.example.com/restablecer-contraseña` (no `http://` ni sin el protocolo).

2. **Múltiples ambientes:** Si tienes desarrollo, staging y producción, agrega todas las URLs en Supabase.

3. **Wildcards:** Supabase no soporta wildcards, debes agregar cada URL específica.

4. **Actualizar después de cambios de dominio:** Si cambias el dominio de tu app, actualiza las URLs en Supabase y la variable `NEXT_PUBLIC_APP_URL`.


