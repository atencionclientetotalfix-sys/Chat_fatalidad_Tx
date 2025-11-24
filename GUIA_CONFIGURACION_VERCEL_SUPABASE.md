# 🔧 Guía Detallada: Configuración de Vercel y Supabase para Recuperación de Contraseña

## 🎯 Objetivo

Esta guía te ayudará a configurar correctamente Vercel y Supabase para que el sistema de recuperación y cambio de contraseña funcione perfectamente en producción.

---

## 📋 PARTE 1: Configuración en Vercel

### Paso 1: Acceder a Variables de Entorno

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto **Chat_Fernando** (o el nombre que tenga)
3. Ve a **Settings** → **Environment Variables**

### Paso 2: Verificar/Crear Variable `NEXT_PUBLIC_APP_URL`

**⚠️ CRÍTICO:** Esta variable es esencial para que funcione la recuperación de contraseña.

1. Busca si existe `NEXT_PUBLIC_APP_URL`
2. Si **NO existe**, haz clic en **"Add New"**
3. Configura así:

   **Nombre de la variable:**
   ```
   NEXT_PUBLIC_APP_URL
   ```

   **Valor:**
   ```
   https://tu-dominio.vercel.app
   ```
   ⚠️ **IMPORTANTE:** Reemplaza `tu-dominio.vercel.app` con tu URL real de Vercel.
   
   Ejemplos:
   - `https://chat-fernando.vercel.app`
   - `https://chat-fernando-abc123.vercel.app`
   - `https://tu-dominio-personalizado.com` (si tienes dominio personalizado)

4. **Marcar para todos los entornos:**
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**

5. Haz clic en **"Save"**

### Paso 3: Verificar Otras Variables Requeridas

Asegúrate de que estas variables también estén configuradas:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
OPENAI_API_KEY=tu_openai_key_aqui
OPENAI_ASSISTANT_ID=asst_6s4kpekduMglBWAJxiVdmnAy
```

**Todas deben estar marcadas para:**
- ✅ Production
- ✅ Preview  
- ✅ Development

### Paso 4: Redesplegar la Aplicación

**Después de agregar/modificar variables de entorno:**

1. Ve a **Deployments**
2. Haz clic en los **3 puntos** (⋯) del último deployment
3. Selecciona **"Redeploy"**
4. Confirma el redespliegue

**O simplemente:**
- Haz un commit y push (Vercel redesplegará automáticamente)

---

## 📋 PARTE 2: Configuración en Supabase

### Paso 1: Acceder a Configuración de URLs

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. En el menú lateral izquierdo, ve a **Authentication**
4. Haz clic en **URL Configuration**

### Paso 2: Configurar Redirect URLs

En la sección **"Redirect URLs"**, debes agregar **TODAS** las URLs donde tu aplicación puede estar accesible.

**Formato:** Una URL por línea, sin comas ni puntos y comas.

#### Para Producción (Vercel):

```
https://tu-dominio.vercel.app/restablecer-contraseña
https://tu-dominio.vercel.app/
```

**Ejemplo real:**
```
https://chat-fernando.vercel.app/restablecer-contraseña
https://chat-fernando.vercel.app/
```

#### Si tienes dominio personalizado:

```
https://tu-dominio-personalizado.com/restablecer-contraseña
https://tu-dominio-personalizado.com/
```

#### Para Desarrollo Local (opcional, pero recomendado):

```
http://localhost:3000/restablecer-contraseña
http://localhost:3000/
```

### Paso 3: Configuración Completa de Ejemplo

**Si tu aplicación está en:**
- Producción: `https://chat-fernando.vercel.app`
- Desarrollo: `http://localhost:3000`

**Entonces en Supabase debes tener:**

```
http://localhost:3000/restablecer-contraseña
http://localhost:3000/
https://chat-fernando.vercel.app/restablecer-contraseña
https://chat-fernando.vercel.app/
```

### Paso 4: Guardar Cambios

1. Haz clic en **"Save"** o **"Guardar"**
2. Los cambios se aplican **inmediatamente** (no requiere redespliegue)

---

## 🔍 PARTE 3: Verificación y Pruebas

### Verificación 1: Variables de Entorno en Vercel

1. Ve a **Settings** → **Environment Variables**
2. Verifica que `NEXT_PUBLIC_APP_URL` tenga el valor correcto
3. Verifica que esté marcada para **Production**

### Verificación 2: URLs en Supabase

1. Ve a **Authentication** → **URL Configuration**
2. Verifica que tu URL de producción esté en la lista
3. Verifica que la URL sea **exactamente** igual (con `https://`, sin trailing slash inconsistente)

### Verificación 3: Probar el Flujo Completo

1. **Ir a la aplicación en producción:**
   - Ve a `https://tu-dominio.vercel.app/recuperar-contraseña`

2. **Solicitar recuperación:**
   - Ingresa un email autorizado
   - Haz clic en "Enviar enlace de recuperación"

3. **Revisar email:**
   - Revisa la bandeja de entrada del email
   - Debe llegar un email de Supabase con un enlace

4. **Hacer clic en el enlace:**
   - El enlace debe redirigir a `https://tu-dominio.vercel.app/restablecer-contraseña?code=...`
   - **NO debe redirigir a localhost**
   - Debe mostrar el formulario de restablecer contraseña

5. **Restablecer contraseña:**
   - Ingresa nueva contraseña
   - Confirma contraseña
   - Debe redirigir al login

---

## 🐛 Solución de Problemas

### Problema 1: Redirige a localhost en lugar de producción

**Síntomas:**
- Al hacer clic en el enlace del email, la URL es `http://localhost:3000/restablecer-contraseña`
- Aparece error "ERR_CONNECTION_REFUSED"

**Causa:**
- `NEXT_PUBLIC_APP_URL` no está configurada en Vercel
- O está configurada con el valor incorrecto

**Solución:**
1. Ve a Vercel → Settings → Environment Variables
2. Verifica que `NEXT_PUBLIC_APP_URL` exista
3. Verifica que el valor sea `https://tu-dominio.vercel.app` (sin trailing slash)
4. Redesplega la aplicación

### Problema 2: Error "Invalid redirect URL"

**Síntomas:**
- Al solicitar recuperación, aparece error "Invalid redirect URL"

**Causa:**
- La URL en Supabase no coincide con la URL que se está enviando

**Solución:**
1. Ve a Supabase → Authentication → URL Configuration
2. Verifica que la URL en la lista sea **exactamente** igual a la de producción
3. Debe incluir `https://` (no `http://`)
4. Debe ser la URL completa: `https://tu-dominio.vercel.app/restablecer-contraseña`

### Problema 3: El enlace del email no funciona

**Síntomas:**
- El enlace del email redirige a una página en blanco
- O muestra un error

**Causa:**
- La URL no está en la lista de Redirect URLs de Supabase

**Solución:**
1. Ve a Supabase → Authentication → URL Configuration
2. Agrega la URL exacta (con protocolo, dominio y ruta)
3. Guarda los cambios
4. Prueba nuevamente (puede tomar unos minutos en aplicarse)

### Problema 4: Variable de entorno no se aplica

**Síntomas:**
- Agregaste `NEXT_PUBLIC_APP_URL` pero sigue usando localhost

**Causa:**
- La aplicación necesita redesplegarse después de agregar variables

**Solución:**
1. Ve a Vercel → Deployments
2. Haz clic en los 3 puntos del último deployment
3. Selecciona "Redeploy"
4. Espera a que termine el redespliegue
5. Prueba nuevamente

---

## ✅ Checklist Final

Antes de considerar que está todo configurado:

- [ ] `NEXT_PUBLIC_APP_URL` configurada en Vercel con la URL de producción
- [ ] `NEXT_PUBLIC_APP_URL` marcada para Production, Preview y Development
- [ ] URL de producción agregada en Supabase → Authentication → URL Configuration
- [ ] URL de desarrollo agregada en Supabase (opcional pero recomendado)
- [ ] Aplicación redesplegada en Vercel después de agregar variables
- [ ] Probar flujo completo: solicitar → email → restablecer
- [ ] Verificar que NO redirija a localhost en producción

---

## 📝 Notas Importantes

1. **Variables de entorno:** Las variables `NEXT_PUBLIC_*` son accesibles en el cliente. No pongas información sensible aquí.

2. **URLs en Supabase:** Deben ser **exactamente** iguales. Cualquier diferencia (mayúsculas, trailing slash, protocolo) causará error.

3. **Redespliegue:** Después de agregar/modificar variables de entorno en Vercel, **siempre** redesplega la aplicación.

4. **Tiempo de propagación:** Los cambios en Supabase se aplican inmediatamente, pero puede tomar unos minutos en algunos casos.

5. **Dominios personalizados:** Si usas un dominio personalizado, asegúrate de agregarlo también en Supabase.

---

## 🆘 ¿Necesitas Ayuda?

Si después de seguir esta guía aún tienes problemas:

1. Verifica la consola del navegador (F12) para ver errores específicos
2. Revisa los logs de Vercel en el deployment
3. Verifica los logs de Supabase en Authentication → Logs
4. Compara tu configuración con esta guía paso a paso

---

**Última actualización:** $(date)

