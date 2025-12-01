# 📚 Documentación Técnica Completa - ASISTENTES HSE PROFESIONAL

Este documento contiene toda la documentación técnica del proyecto, organizada por secciones.

---

## 📋 Índice

1. [Variables de Entorno](#variables-de-entorno)
2. [Configuración de Usuarios Permitidos](#configuración-de-usuarios-permitidos)
3. [Despliegue en Vercel](#despliegue-en-vercel)
4. [Configuración de Recuperación de Contraseña](#configuración-de-recuperación-de-contraseña)
5. [Guías de Verificación y Testing](#guías-de-verificación-y-testing)
6. [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Variables de Entorno

### Variables Requeridas

#### Supabase (Públicas - Accesibles desde el cliente)

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Dónde obtenerlas:**
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Settings → API
3. Copia la **Project URL** y la **anon public** key

#### Supabase (Privada - Solo servidor)

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Dónde obtenerla:**
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Settings → API
3. Copia la **service_role** key (⚠️ **NUNCA** la expongas en el cliente)

#### OpenAI

```env
OPENAI_API_KEY=sk-proj-...
OPENAI_ASSISTANT_ID=asst_6s4kpekduMglBWAJxiVdmnAy
```

**Dónde obtenerlas:**
1. Ve a [OpenAI Platform](https://platform.openai.com)
2. API Keys → Create new secret key
3. Para el Assistant ID, ve a Assistants y copia el ID del asistente que quieras usar

#### Next.js (Opcional pero recomendado)

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Para desarrollo local:** `http://localhost:3000`  
**Para producción:** `https://tu-dominio.vercel.app`

### Archivo .env.local

Crea un archivo `.env.local` en la raíz del proyecto con todas las variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# OpenAI
OPENAI_API_KEY=tu_openai_api_key_aqui
OPENAI_ASSISTANT_ID=asst_6s4kpekduMglBWAJxiVdmnAy

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Verificación

Ejecuta el script de verificación:

```bash
npm run verificar-env
```

O directamente:

```bash
node scripts/verificar_env.js
```

### Seguridad

- ⚠️ **NUNCA** commitees el archivo `.env.local` al repositorio
- El archivo `.gitignore` ya está configurado para ignorar archivos `.env*`
- Para producción en Vercel, configura las variables en:
  - Vercel Dashboard → Settings → Environment Variables

---

## 👥 Configuración de Usuarios Permitidos

### Paso 1: Ejecutar la Migración SQL

1. Ve al **Dashboard de Supabase**
2. Navega a **SQL Editor**
3. Copia y pega el contenido completo de `supabase/migrations/002_usuarios_permitidos.sql`
4. Haz clic en **Run** o ejecuta la consulta

Esto creará:
- La tabla `usuarios_permitidos`
- Los índices necesarios
- Las políticas de seguridad (RLS)
- El usuario inicial (Fernando Etchegaray)

### Paso 2: Agregar Usuarios

**Opción A: Desde SQL Editor (Recomendado)**

```sql
INSERT INTO public.usuarios_permitidos (email, nombre, activo)
VALUES ('SEGUNDO_EMAIL_AQUI@correo.com', 'Nombre Segundo Usuario', true)
ON CONFLICT (email) DO NOTHING;
```

**Opción B: Desde Table Editor**

1. Ve a **Table Editor** en Supabase
2. Selecciona la tabla `usuarios_permitidos`
3. Haz clic en **Insert row**
4. Completa los campos:
   - `email`: El email del usuario
   - `nombre`: El nombre (opcional)
   - `activo`: `true`
5. Guarda el registro

### Gestión de Usuarios

**Activar/Desactivar Usuario (sin eliminar)**

```sql
-- Desactivar usuario
UPDATE public.usuarios_permitidos
SET activo = false, actualizado_en = NOW()
WHERE email = 'email@correo.com';

-- Reactivar usuario
UPDATE public.usuarios_permitidos
SET activo = true, actualizado_en = NOW()
WHERE email = 'email@correo.com';
```

**Eliminar Usuario**

```sql
DELETE FROM public.usuarios_permitidos
WHERE email = 'email@correo.com';
```

**Agregar Nuevo Usuario**

```sql
INSERT INTO public.usuarios_permitidos (email, nombre, activo)
VALUES ('nuevo@correo.com', 'Nombre Nuevo Usuario', true)
ON CONFLICT (email) DO NOTHING;
```

### Verificación

Ejecuta esta consulta para ver todos los usuarios activos:

```sql
SELECT * FROM public.usuarios_permitidos WHERE activo = true;
```

### Importante

- Los usuarios deben estar **tanto en `usuarios_permitidos`** (para acceso a la app) **como en Supabase Auth** (para autenticación)
- Si un usuario está en `usuarios_permitidos` pero no en Supabase Auth, no podrá iniciar sesión
- Si un usuario está en Supabase Auth pero no en `usuarios_permitidos`, será rechazado en el login
- El email se compara en minúsculas (case-insensitive)
- Solo usuarios con `activo = true` pueden acceder
- Los cambios son inmediatos (no requiere reiniciar el servidor)

---

## 🚀 Despliegue en Vercel

### Pre-requisitos

- ✅ Repositorio en GitHub
- ✅ Cuenta en Vercel
- ✅ Proyecto Supabase configurado
- ✅ API Key de OpenAI
- ✅ Variables de entorno listas

### Paso 1: Preparar el Repositorio

1. **Verificar que no hay archivos sensibles:**
   ```bash
   git status
   # Asegúrate de que NO aparezcan archivos .env
   ```

2. **Hacer commit y push:**
   ```bash
   git add .
   git commit -m "feat: Preparación para despliegue en Vercel"
   git push origin main
   ```

### Paso 2: Configurar Vercel

1. **Importar Proyecto:**
   - Ve a [Vercel Dashboard](https://vercel.com/dashboard)
   - Haz clic en "Add New Project"
   - Selecciona "Import Git Repository"
   - Conecta tu cuenta de GitHub si es necesario
   - Selecciona: `atencionclientetotalfix-sys/Chat_fatalidad_Tx`

2. **Configuración del Proyecto:**
   - **Framework Preset**: Next.js (detectado automáticamente)
   - **Root Directory**: `./` (raíz del proyecto)
   - **Build Command**: `npm run build` (automático)
   - **Output Directory**: `.next` (automático)
   - **Install Command**: `npm install` (automático)

3. **Variables de Entorno:**
   
   Ve a **Settings → Environment Variables** y agrega:

   | Variable | Valor | Ambiente |
   |----------|-------|----------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Tu URL de Supabase | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu Anon Key de Supabase | Production, Preview, Development |
   | `SUPABASE_SERVICE_ROLE_KEY` | Tu Service Role Key | Production, Preview, Development |
   | `OPENAI_API_KEY` | Tu API Key de OpenAI | Production, Preview, Development |
   | `OPENAI_ASSISTANT_ID` | `asst_6s4kpekduMglBWAJxiVdmnAy` | Production, Preview, Development |
   | `NEXT_PUBLIC_APP_URL` | URL de tu app (ej: `https://chat-fatalidad.vercel.app`) | Production, Preview, Development |

   ⚠️ **IMPORTANTE**: 
   - Marca todas las variables para todos los ambientes (Production, Preview, Development)
   - Actualiza `NEXT_PUBLIC_APP_URL` después del primer despliegue con la URL real

### Paso 3: Desplegar

1. **Primer Despliegue:**
   - Haz clic en "Deploy"
   - Espera a que termine el build (2-5 minutos)
   - Verifica que no haya errores en el log

2. **Verificar Despliegue:**
   - Vercel te dará una URL temporal (ej: `https://chat-fatalidad-tx.vercel.app`)
   - Visita la URL y prueba el login
   - Verifica que todo funcione correctamente

### Paso 4: Configurar Dominio Personalizado (Opcional)

1. **En Vercel Dashboard:**
   - Ve a **Settings → Domains**
   - Agrega tu dominio personalizado
   - Configura los DNS según las instrucciones de Vercel

2. **Actualizar Variable de Entorno:**
   - Actualiza `NEXT_PUBLIC_APP_URL` con tu dominio personalizado
   - Haz un nuevo despliegue

### Despliegues Automáticos

Vercel desplegará automáticamente:
- **Production**: Cada push a `main` o `master`
- **Preview**: Cada push a otras ramas (crea previews automáticos)

---

## 🔐 Configuración de Recuperación de Contraseña

### ⚠️ PROBLEMA COMÚN: Página en Blanco

Si al hacer clic en el enlace del email de recuperación la página queda en blanco, **es porque falta configurar las URLs de redirección en Supabase**.

### Paso 1: Configurar URLs de Redirección en Supabase

1. Ve al [Dashboard de Supabase](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Authentication** → **URL Configuration** (en el menú lateral izquierdo)

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

Haz clic en **"Save"** o **"Guardar"**. Los cambios se aplican inmediatamente.

### Paso 2: Verificar Variables de Entorno

**En Desarrollo (`.env.local`)**

Asegúrate de tener:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**En Producción (Vercel)**

Ve a **Vercel Dashboard** → **Settings** → **Environment Variables** y verifica:

- ✅ `NEXT_PUBLIC_SUPABASE_URL` está configurada
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` está configurada
- ✅ `NEXT_PUBLIC_APP_URL` está configurada con la URL de producción (ej: `https://tu-dominio.vercel.app`)

**⚠️ IMPORTANTE:** Todas las variables deben estar marcadas para:
- ✅ Production
- ✅ Preview
- ✅ Development

### Paso 3: Redesplegar la Aplicación

**Después de agregar/modificar variables de entorno:**

1. Ve a **Deployments**
2. Haz clic en los **3 puntos** (⋯) del último deployment
3. Selecciona **"Redeploy"**
4. Confirma el redespliegue

**O simplemente:**
- Haz un commit y push (Vercel redesplegará automáticamente)

### Flujo de Recuperación de Contraseña

1. **Usuario solicita recuperación:**
   - Va a `/recuperar-contraseña`
   - Ingresa su email
   - El sistema envía un email con un enlace

2. **Usuario hace clic en el email:**
   - Supabase redirige a la URL configurada con un código: `?code=abc123...`
   - La página `/restablecer-contraseña` recibe el código
   - Verifica el código y muestra el formulario

3. **Usuario restablece contraseña:**
   - Ingresa nueva contraseña
   - Confirma la contraseña
   - El sistema actualiza la contraseña
   - Redirige al login

### Funcionalidades Disponibles

1. **Recuperación de Contraseña** (`/recuperar-contraseña`)
   - Para usuarios que olvidaron su contraseña
   - Verificación de email autorizado antes de enviar
   - Envío de email con enlace de recuperación
   - Página pública (no requiere autenticación)

2. **Restablecimiento de Contraseña** (`/restablecer-contraseña`)
   - Para usuarios que recibieron el enlace de recuperación
   - Verificación automática de token
   - Establecimiento de nueva contraseña
   - Página pública (requiere token válido)

3. **Cambio de Contraseña** (`/cambiar-contraseña`)
   - Para usuarios autenticados que quieren cambiar su contraseña
   - Verificación de contraseña actual
   - Validación de nueva contraseña
   - Página protegida (requiere autenticación)

---

## ✅ Guías de Verificación y Testing

### Verificación de Variables de Entorno

Ejecuta el script de verificación:

```bash
npm run verificar-env
```

### Verificación de Migraciones en Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Navega a **SQL Editor**

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

**Verificar migraciones**
1. Abre el archivo `supabase/verificar_migraciones.sql`
2. Copia todo el contenido
3. Pégalo en el SQL Editor de Supabase
4. Ejecuta y revisa los resultados

**✅ Resultado esperado:**
- 4 tablas deben existir: `perfiles`, `conversaciones`, `mensajes`, `usuarios_permitidos`
- RLS debe estar habilitado en todas las tablas
- Debe haber al menos 1 usuario permitido activo
- El trigger `on_auth_user_created` debe existir

### Checklist de Verificación

#### Configuración Inicial
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada
- [ ] `OPENAI_API_KEY` configurada
- [ ] `OPENAI_ASSISTANT_ID` configurada
- [ ] `NEXT_PUBLIC_APP_URL` configurada

#### Base de Datos
- [ ] `001_initial_schema.sql` ejecutada sin errores
- [ ] `002_usuarios_permitidos.sql` ejecutada sin errores
- [ ] Tabla `perfiles` existe
- [ ] Tabla `conversaciones` existe
- [ ] Tabla `mensajes` existe
- [ ] Tabla `usuarios_permitidos` existe
- [ ] RLS habilitado en todas las tablas

#### Usuarios
- [ ] Al menos un usuario en `usuarios_permitidos`
- [ ] Usuario tiene `activo = true`
- [ ] Usuario existe en Supabase Auth
- [ ] Usuario puede iniciar sesión

#### Seguridad
- [ ] Usuario permitido puede iniciar sesión ✅
- [ ] Usuario no permitido NO puede iniciar sesión ❌
- [ ] Usuario desactivado es redirigido automáticamente ✅
- [ ] Middleware protege rutas del dashboard ✅
- [ ] Rutas de API verifican usuario permitido ✅

#### Funcionalidad
- [ ] Dashboard carga después del login
- [ ] Crear nueva conversación funciona
- [ ] Enviar mensaje funciona
- [ ] Respuesta del asistente se recibe
- [ ] Cargar conversación existente funciona
- [ ] Exportar a PDF funciona
- [ ] Cargar archivo funciona

### Escenarios de Testing

#### Escenario 1: Flujo Completo de Usuario Permitido

1. Abre `http://localhost:3000`
2. Debe redirigir a `/login`
3. Ingresa email y contraseña del usuario permitido
4. Haz clic en "Iniciar sesión"
5. Debe redirigir a `/dashboard`
6. Crea una nueva conversación
7. Envía un mensaje de prueba
8. Verifica que recibas respuesta del asistente
9. Exporta la conversación a PDF
10. Cierra sesión

**Resultado esperado:** ✅ Todo funciona correctamente

#### Escenario 2: Bloqueo de Usuario No Permitido

1. Abre `http://localhost:3000`
2. Ingresa email y contraseña del usuario NO permitido
3. Haz clic en "Iniciar sesión"

**Resultado esperado:** 
- ❌ Debe mostrar: "Acceso denegado. Este correo no está autorizado."
- ❌ NO debe redirigir al dashboard
- ❌ NO debe permitir el acceso

#### Escenario 3: Desactivación de Usuario Activo

1. Inicia sesión con un usuario permitido
2. Abre el dashboard en una pestaña
3. En otra pestaña, abre Supabase Dashboard
4. Ejecuta:
   ```sql
   UPDATE public.usuarios_permitidos
   SET activo = false, actualizado_en = NOW()
   WHERE email = 'usuario@email.com';
   ```
5. Vuelve a la pestaña del dashboard
6. Recarga la página (F5)

**Resultado esperado:**
- ✅ Debe redirigir automáticamente a `/login?error=no_autorizado`
- ✅ La sesión debe estar cerrada

---

## 🐛 Solución de Problemas

### Error: "Your project's URL and API key are required to create a Supabase client!"

Este error indica que las variables de entorno de Supabase no están configuradas correctamente.

**Solución paso a paso:**

1. **Verificar que el archivo `.env.local` existe** en la raíz del proyecto (misma carpeta que `package.json`)

2. **Verificar el contenido del archivo `.env.local`** - debe tener exactamente estas líneas (sin espacios extra):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   OPENAI_API_KEY=sk-proj-...
   OPENAI_ASSISTANT_ID=asst_6s4kpekduMglBWAJxiVdmnAy
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
   ⚠️ **IMPORTANTE:**
   - No uses comillas alrededor de los valores
   - No dejes espacios antes o después del `=`
   - Cada variable en una línea separada
   - Las variables `NEXT_PUBLIC_*` son las que se exponen al navegador

3. **REINICIAR EL SERVIDOR** (MUY IMPORTANTE)
   - Next.js solo carga las variables cuando se inicia el servidor
   - Detén el servidor actual (`Ctrl + C`)
   - Inicia el servidor de nuevo: `npm run dev`
   - Espera a que veas "Ready in X seconds"
   - Recarga el navegador (F5 o Ctrl+R)

4. **Verificar que las variables se cargaron:**
   ```bash
   npm run verificar-env
   ```
   O ejecuta el diagnóstico:
   ```bash
   node scripts/diagnostico_env.js
   ```

**Problemas comunes:**
- "El archivo existe pero no funciona" → Reinicia el servidor (`Ctrl+C` y luego `npm run dev`)
- "No encuentro el archivo" → Asegúrate de que esté en la raíz (misma carpeta que `package.json`)
- "Las variables están pero siguen undefined" → Reinicia el servidor y limpia la caché: `rm -rf .next` y luego `npm run dev`

### El chat no funciona

1. Verifica que todas las variables requeridas estén configuradas
2. Ejecuta `npm run verificar-env` para ver qué falta
3. Revisa la consola del navegador (F12) para ver errores
4. Revisa los logs del servidor si estás en desarrollo

### Error: "OPENAI_ASSISTANT_ID no está configurado"

- Verifica que el archivo `.env.local` existe en la raíz del proyecto
- Verifica que la variable `OPENAI_ASSISTANT_ID` esté escrita correctamente
- Reinicia el servidor de desarrollo después de agregar/modificar variables

### Error: "OPENAI_API_KEY no está configurada"

- Verifica que la clave de API de OpenAI sea válida
- Asegúrate de que tenga permisos para usar la API de Assistants

### Error: "Environment variables not found" (Vercel)

- Verifica que todas las variables estén configuradas en Vercel
- Asegúrate de que estén marcadas para el ambiente correcto (Production, Preview, Development)
- Verifica que no haya espacios extra en los valores

### Error: "Build failed" (Vercel)

- Revisa los logs de build en Vercel
- Verifica que `package.json` tenga todas las dependencias
- Asegúrate de que no haya errores de TypeScript
- Limpia el caché de build en Vercel (Settings → General → Clear Build Cache)
- Verifica que todos los layouts tengan `metadata` exportada

### Error: "Function timeout" (Vercel)

- Verifica que `vercel.json` tenga `maxDuration` configurado para las funciones
- Las funciones de chat tienen 120 segundos configurados
- Si necesitas más tiempo, considera actualizar el plan de Vercel

### Error: "ENOENT: no such file or directory"

- Verifica que todos los layouts tengan `metadata` exportada
- Limpia el caché de build en Vercel
- Verifica la estructura de archivos
- Reinstala dependencias localmente: `rm -rf node_modules package-lock.json && npm install`

### Error: "Supabase connection failed"

- Verifica que las URLs y keys de Supabase sean correctas
- Asegúrate de que el proyecto Supabase esté activo
- Verifica que las políticas RLS estén configuradas
- Verifica que las migraciones se hayan ejecutado

### Error: "OpenAI API error"

- Verifica que la API Key sea válida
- Asegúrate de que el Assistant ID sea correcto
- Verifica que tengas créditos en OpenAI
- Revisa los logs de Vercel para más detalles del error

### Error: Dynamic server usage / ENOENT client-reference-manifest

Si encuentras errores como:
- `Dynamic server usage: Page couldn't be rendered statically because it used 'cookies'`
- `ENOENT: no such file or directory, lstat '/vercel/path0/.next/server/app/(dashboard)/page_client-reference-manifest.js'`

**Causa**: Las rutas API usan `cookies()` (a través de `createClient()`) pero Next.js intenta pre-renderizarlas estáticamente durante el build.

**Solución aplicada**: Todas las rutas API ahora incluyen `export const dynamic = 'force-dynamic'` para forzar el renderizado dinámico:

```typescript
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'  // ← Fuerza renderizado dinámico
export const maxDuration = 30
```

### Página en blanco al hacer clic en email de recuperación

**Causa**: Falta configurar las URLs de redirección en Supabase.

**Solución**:
1. Ve a Supabase Dashboard → Authentication → URL Configuration
2. Agrega las URLs en "Redirect URLs":
   - `http://localhost:3000/restablecer-contraseña` (desarrollo)
   - `https://tu-dominio.vercel.app/restablecer-contraseña` (producción)
3. Guarda los cambios
4. Verifica que `NEXT_PUBLIC_APP_URL` esté configurada correctamente

---

## 📝 Notas Adicionales

- El primer despliegue puede tardar 3-5 minutos
- Los despliegues subsecuentes son más rápidos (1-2 minutos)
- Vercel tiene límites de tiempo de ejecución (30s para funciones serverless)
- Si necesitas más tiempo, considera actualizar el plan de Vercel
- Los cambios en `usuarios_permitidos` son inmediatos (no requiere reiniciar el servidor)
- El email se compara en minúsculas (case-insensitive)

---

**¿Problemas?** Contacta a AutomatizaFix - [www.automatizafix.com](https://www.automatizafix.com)
