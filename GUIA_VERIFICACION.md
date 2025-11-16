# 🔍 Guía de Verificación Completa - Chat Fernando

Esta guía te ayudará a verificar que todo el sistema esté funcionando correctamente antes de usar la aplicación en producción.

## 📋 Índice

1. [Verificación de Variables de Entorno](#1-verificación-de-variables-de-entorno)
2. [Verificación de Migraciones en Supabase](#2-verificación-de-migraciones-en-supabase)
3. [Verificación de Usuarios Permitidos](#3-verificación-de-usuarios-permitidos)
4. [Pruebas del Flujo Completo](#4-pruebas-del-flujo-completo)
5. [Checklist Final](#5-checklist-final)

---

## 1. Verificación de Variables de Entorno

### Paso 1.1: Verificar archivo .env.local

Asegúrate de tener un archivo `.env.local` en la raíz del proyecto con todas las variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=tu_openai_api_key
OPENAI_ASSISTANT_ID=asst_6s4kpekduMglBWAJxiVdmnAy

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Paso 1.2: Ejecutar script de verificación (Opcional)

```bash
# Instalar dependencias si es necesario
pip install supabase python-dotenv

# Ejecutar script de verificación
cd backend/scripts
python verificar_configuracion.py
```

**✅ Resultado esperado:** Todas las variables deben estar configuradas y la conexión a Supabase debe ser exitosa.

---

## 2. Verificación de Migraciones en Supabase

### Paso 2.1: Acceder a Supabase Dashboard

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Navega a **SQL Editor**

### Paso 2.2: Ejecutar migraciones

**Migración 1: Esquema inicial**
1. Abre el archivo `supabase/migrations/001_initial_schema.sql`
2. Copia todo el contenido
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run** o presiona `Ctrl+Enter`
5. Verifica que no haya errores

**Migración 2: Usuarios permitidos**
1. Abre el archivo `supabase/migrations/002_usuarios_permitidos.sql`
2. Copia todo el contenido
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run** o presiona `Ctrl+Enter`
5. Verifica que no haya errores

### Paso 2.3: Verificar migraciones

Ejecuta el script de verificación SQL:

1. Abre el archivo `supabase/verificar_migraciones.sql`
2. Copia todo el contenido
3. Pégalo en el SQL Editor de Supabase
4. Ejecuta y revisa los resultados

**✅ Resultado esperado:**
- 4 tablas deben existir: `perfiles`, `conversaciones`, `mensajes`, `usuarios_permitidos`
- RLS debe estar habilitado en todas las tablas
- Debe haber al menos 1 usuario permitido activo
- El trigger `on_auth_user_created` debe existir

---

## 3. Verificación de Usuarios Permitidos

### Paso 3.1: Verificar usuarios en la tabla

Ejecuta esta consulta en Supabase SQL Editor:

```sql
SELECT 
    email,
    nombre,
    activo,
    creado_en
FROM public.usuarios_permitidos
ORDER BY creado_en DESC;
```

**✅ Resultado esperado:** Debe aparecer al menos el usuario `fernando.etchegaray@qualivita.cl` con `activo = true`

### Paso 3.2: Verificar usuarios en Supabase Auth

1. Ve a **Authentication > Users** en Supabase Dashboard
2. Verifica que el usuario esté registrado
3. Si no existe, créalo manualmente o permite el registro

**⚠️ IMPORTANTE:** El usuario debe estar:
- ✅ En la tabla `usuarios_permitidos` con `activo = true`
- ✅ En Supabase Auth (Authentication > Users)

---

## 4. Pruebas del Flujo Completo

### Prueba 1: Login con Usuario Permitido

**Objetivo:** Verificar que un usuario permitido puede iniciar sesión correctamente.

**Pasos:**
1. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
2. Abre `http://localhost:3000` en el navegador
3. Debe redirigir automáticamente a `/login`
4. Ingresa las credenciales de un usuario permitido:
   - Email: `fernando.etchegaray@qualivita.cl` (o el email de un usuario permitido)
   - Contraseña: (la contraseña configurada en Supabase Auth)
5. Haz clic en "Iniciar sesión"

**✅ Resultado esperado:**
- Debe redirigir a `/dashboard`
- Debe mostrar el sidebar con el perfil del usuario
- Debe mostrar la lista de conversaciones (vacía si es la primera vez)

### Prueba 2: Intentar Acceder con Usuario No Permitido

**Objetivo:** Verificar que un usuario no permitido no puede acceder.

**Pasos:**
1. En Supabase SQL Editor, crea un usuario de prueba NO permitido:
   ```sql
   -- Este usuario NO está en usuarios_permitidos
   -- Pero puedes crearlo en Supabase Auth para probar
   ```
2. Intenta iniciar sesión con ese usuario

**✅ Resultado esperado:**
- Debe mostrar el mensaje: "Acceso denegado. Este correo no está autorizado."
- NO debe permitir el login
- NO debe redirigir al dashboard

### Prueba 3: Desactivar Usuario Activo y Verificar Cierre de Sesión

**Objetivo:** Verificar que si un usuario es desactivado, su sesión se cierra automáticamente.

**Pasos:**
1. Inicia sesión con un usuario permitido (Prueba 1)
2. Una vez en el dashboard, abre otra pestaña del navegador
3. En Supabase SQL Editor, desactiva el usuario:
   ```sql
   UPDATE public.usuarios_permitidos
   SET activo = false, actualizado_en = NOW()
   WHERE email = 'fernando.etchegaray@qualivita.cl';
   ```
4. En la pestaña del dashboard, intenta:
   - Recargar la página (F5)
   - Navegar a otra ruta del dashboard
   - Enviar un mensaje en el chat

**✅ Resultado esperado:**
- Debe redirigir automáticamente a `/login?error=no_autorizado`
- Debe mostrar el mensaje: "Tu acceso ha sido revocado. Por favor contacta al administrador."
- La sesión debe estar cerrada

### Prueba 4: Reactivar Usuario y Verificar Acceso

**Objetivo:** Verificar que al reactivar un usuario, puede volver a acceder.

**Pasos:**
1. En Supabase SQL Editor, reactiva el usuario:
   ```sql
   UPDATE public.usuarios_permitidos
   SET activo = true, actualizado_en = NOW()
   WHERE email = 'fernando.etchegaray@qualivita.cl';
   ```
2. Intenta iniciar sesión nuevamente

**✅ Resultado esperado:**
- Debe permitir el login
- Debe redirigir al dashboard correctamente

### Prueba 5: Verificar Protección de Rutas de API

**Objetivo:** Verificar que las rutas de API rechazan usuarios no permitidos.

**Pasos:**
1. Inicia sesión con un usuario permitido
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña Network
4. Intenta crear una conversación o enviar un mensaje
5. Verifica las respuestas de las APIs

**✅ Resultado esperado:**
- Todas las peticiones a `/api/chat/*` deben retornar 200 OK
- Si intentas con un usuario no permitido, debe retornar 403 Forbidden

---

## 5. Checklist Final

Usa este checklist para asegurarte de que todo esté correcto:

### Configuración Inicial
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Variables de entorno configuradas en Vercel (si está en producción)
- [ ] Conexión a Supabase verificada
- [ ] API Key de OpenAI configurada y válida

### Base de Datos
- [ ] Migración `001_initial_schema.sql` ejecutada sin errores
- [ ] Migración `002_usuarios_permitidos.sql` ejecutada sin errores
- [ ] Tabla `perfiles` existe y tiene RLS habilitado
- [ ] Tabla `conversaciones` existe y tiene RLS habilitado
- [ ] Tabla `mensajes` existe y tiene RLS habilitado
- [ ] Tabla `usuarios_permitidos` existe y tiene RLS habilitado
- [ ] Trigger `on_auth_user_created` existe y funciona
- [ ] Función `crear_perfil_automatico` existe

### Usuarios
- [ ] Al menos un usuario en `usuarios_permitidos` con `activo = true`
- [ ] El mismo usuario existe en Supabase Auth
- [ ] El usuario puede iniciar sesión correctamente

### Seguridad
- [ ] Usuario no permitido NO puede iniciar sesión
- [ ] Usuario desactivado es redirigido automáticamente
- [ ] Rutas de API rechazan usuarios no permitidos (403)
- [ ] Middleware protege rutas del dashboard

### Funcionalidad
- [ ] Login funciona correctamente
- [ ] Dashboard carga correctamente
- [ ] Chat se puede usar (si OpenAI está configurado)
- [ ] Crear conversación funciona
- [ ] Enviar mensaje funciona
- [ ] Exportar PDF funciona

---

## 🐛 Solución de Problemas

### Error: "Email no autorizado"
**Causa:** El email no está en `usuarios_permitidos` o está inactivo.
**Solución:**
```sql
-- Verificar usuario
SELECT * FROM public.usuarios_permitidos WHERE email = 'tu@email.com';

-- Si no existe, agregarlo
INSERT INTO public.usuarios_permitidos (email, nombre, activo)
VALUES ('tu@email.com', 'Tu Nombre', true);
```

### Error: "Invalid login credentials"
**Causa:** El usuario no existe en Supabase Auth o la contraseña es incorrecta.
**Solución:**
1. Ve a Supabase Dashboard > Authentication > Users
2. Verifica que el usuario exista
3. Si no existe, créalo manualmente o permite el registro

### Error: "No autorizado" en APIs
**Causa:** El usuario no está autenticado o no está permitido.
**Solución:**
1. Verifica que la sesión esté activa
2. Verifica que el usuario esté en `usuarios_permitidos` con `activo = true`
3. Revisa los logs del servidor para más detalles

### Error: "Tabla no existe"
**Causa:** Las migraciones no se ejecutaron correctamente.
**Solución:**
1. Ejecuta las migraciones nuevamente en Supabase SQL Editor
2. Verifica que no haya errores en la ejecución
3. Usa el script `verificar_migraciones.sql` para diagnosticar

---

## 📞 Soporte

Si encuentras problemas que no se resuelven con esta guía:
1. Revisa los logs del servidor
2. Revisa los logs de Supabase
3. Verifica la consola del navegador (F12)
4. Contacta a AutomatizaFix

---

**Última actualización:** Diciembre 2024

