# ✅ Checklist de Despliegue en Vercel - Chat Fernando

Usa este checklist para asegurarte de que el despliegue en Vercel sea exitoso y sin problemas.

## 📋 Pre-Despliegue

### Configuración de Git
- [ ] Repositorio está en GitHub/GitLab/Bitbucket
- [ ] Rama `main` o `master` está actualizada
- [ ] Todos los cambios están commiteados
- [ ] No hay archivos `.env` o `.env.local` en el repositorio
- [ ] `.gitignore` incluye `.env*` y `.vercel`

### Configuración del Proyecto
- [ ] `package.json` tiene todas las dependencias
- [ ] `next.config.js` está optimizado para producción
- [ ] `vercel.json` está configurado correctamente
- [ ] No hay referencias a `localhost` en el código de producción
- [ ] Todos los archivos `page.tsx` tienen contenido válido
- [ ] Todos los layouts tienen `metadata` exportada

### Variables de Entorno
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - URL del proyecto Supabase
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clave anónima de Supabase
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Clave de servicio de Supabase
- [ ] `OPENAI_API_KEY` - Clave de API de OpenAI
- [ ] `OPENAI_ASSISTANT_ID` - ID del asistente (ej: `asst_6s4kpekduMglBWAJxiVdmnAy`)
- [ ] `NEXT_PUBLIC_APP_URL` - URL de la app (se actualizará después del primer despliegue)

**⚠️ IMPORTANTE:** Todas las variables deben estar marcadas para:
- ✅ Production
- ✅ Preview
- ✅ Development

---

## 🚀 Proceso de Despliegue

### Paso 1: Conectar Repositorio en Vercel
- [ ] Ir a [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Clic en "Add New Project"
- [ ] Importar el repositorio de GitHub
- [ ] Vercel detecta automáticamente Next.js ✅

### Paso 2: Configurar Variables de Entorno
- [ ] Ir a Settings → Environment Variables
- [ ] Agregar todas las variables de entorno (ver lista arriba)
- [ ] Marcar para Production, Preview y Development
- [ ] Guardar cambios

### Paso 3: Configuración del Proyecto
- [ ] Framework: Next.js (detectado automáticamente)
- [ ] Build Command: `npm run build` (por defecto)
- [ ] Output Directory: `.next` (por defecto)
- [ ] Install Command: `npm install` (por defecto)
- [ ] Node.js Version: 18.x o superior

### Paso 4: Primer Despliegue
- [ ] Clic en "Deploy"
- [ ] Esperar a que termine el build (2-5 minutos)
- [ ] Verificar que no haya errores en el log
- [ ] Build exitoso ✅

### Paso 5: Verificar Despliegue
- [ ] La URL de despliegue funciona (ej: `https://chat-fernando.vercel.app`)
- [ ] La página carga correctamente
- [ ] No hay errores en la consola del navegador
- [ ] El login funciona
- [ ] El dashboard carga correctamente

### Paso 6: Actualizar NEXT_PUBLIC_APP_URL
- [ ] Copiar la URL de producción de Vercel
- [ ] Ir a Settings → Environment Variables
- [ ] Actualizar `NEXT_PUBLIC_APP_URL` con la URL real
- [ ] Guardar cambios
- [ ] Hacer un nuevo despliegue (o esperar al siguiente push)

---

## 🔍 Verificaciones Post-Despliegue

### Funcionalidad Básica
- [ ] Página principal carga correctamente
- [ ] Redirección a `/login` funciona
- [ ] Formulario de login se muestra
- [ ] No hay errores 404 o 500

### Autenticación
- [ ] Login con usuario permitido funciona
- [ ] Redirección a `/dashboard` después del login funciona
- [ ] Usuario no permitido es rechazado correctamente
- [ ] Cerrar sesión funciona

### Dashboard
- [ ] Dashboard carga después del login
- [ ] Sidebar se muestra correctamente
- [ ] Perfil de usuario se muestra
- [ ] Lista de conversaciones se muestra (vacía si es primera vez)

### Chat
- [ ] Crear nueva conversación funciona
- [ ] Enviar mensaje funciona
- [ ] Respuesta del asistente se recibe
- [ ] Historial de mensajes se muestra
- [ ] Exportar a PDF funciona

### APIs
- [ ] `/api/auth/verify-email` funciona
- [ ] `/api/chat/thread` funciona
- [ ] `/api/chat` funciona
- [ ] `/api/chat/mensajes` funciona
- [ ] `/api/chat/export` funciona
- [ ] `/api/upload` funciona

### Performance
- [ ] Tiempo de carga inicial < 3 segundos
- [ ] Tiempo de respuesta de APIs < 5 segundos
- [ ] No hay errores en los logs de Vercel

---

## 🐛 Solución de Problemas Comunes

### Error: "Build failed"
**Solución:**
1. Revisar logs de build en Vercel
2. Verificar que todas las dependencias estén en `package.json`
3. Verificar que no haya errores de TypeScript
4. Limpiar caché de build en Vercel (Settings → General → Clear Build Cache)

### Error: "Environment variables not found"
**Solución:**
1. Verificar que todas las variables estén configuradas
2. Verificar que estén marcadas para el ambiente correcto
3. Verificar que no haya espacios extra en los valores

### Error: "Supabase connection failed"
**Solución:**
1. Verificar que las URLs y keys de Supabase sean correctas
2. Verificar que el proyecto Supabase esté activo
3. Verificar que las políticas RLS estén configuradas

### Error: "OpenAI API error"
**Solución:**
1. Verificar que la API Key sea válida
2. Verificar que el Assistant ID sea correcto
3. Verificar que tengas créditos en OpenAI

### Error: "Function timeout"
**Solución:**
1. Verificar que `vercel.json` tenga `maxDuration` configurado
2. Para funciones que necesitan más tiempo, considerar aumentar el timeout
3. Verificar que el plan de Vercel permita timeouts más largos

### Error: "ENOENT: no such file or directory"
**Solución:**
1. Verificar que todos los layouts tengan `metadata` exportada
2. Limpiar caché de build
3. Verificar estructura de archivos
4. Reinstalar dependencias localmente y hacer commit

---

## 📊 Checklist Final

### Antes de Marcar como "Listo para Producción"
- [ ] Todas las variables de entorno configuradas
- [ ] Build exitoso sin errores
- [ ] Todas las funcionalidades probadas
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en logs de Vercel
- [ ] Performance aceptable
- [ ] Seguridad verificada (usuarios permitidos funcionan)
- [ ] Documentación actualizada

### Configuración de Dominio Personalizado (Opcional)
- [ ] Dominio agregado en Vercel (Settings → Domains)
- [ ] DNS configurado correctamente
- [ ] SSL/HTTPS funcionando
- [ ] `NEXT_PUBLIC_APP_URL` actualizado con dominio personalizado
- [ ] Nuevo despliegue realizado

---

## ✅ Firma de Verificación

**Fecha de despliegue:** _______________

**Desplegado por:** _______________

**URL de producción:** _______________

**Estado:**
- [ ] ✅ DESPLIEGUE EXITOSO - Todo funciona correctamente
- [ ] ⚠️  PROBLEMAS MENORES - Funciona pero con advertencias
- [ ] ❌ DESPLIEGUE FALLIDO - Requiere correcciones

**Notas adicionales:**
_________________________________________________
_________________________________________________
_________________________________________________

---

## 🔄 Despliegues Futuros

Después del primer despliegue exitoso:
- ✅ Cada push a `main` desplegará automáticamente
- ✅ Cada push a otras ramas creará un preview
- ✅ Los despliegues son más rápidos (1-2 minutos)

**Última actualización:** Diciembre 2024

