# Guía de Despliegue - ASISTENTES HSE PROFESIONAL

## 📋 Pre-requisitos

- ✅ Repositorio en GitHub
- ✅ Cuenta en Vercel
- ✅ Proyecto Supabase configurado
- ✅ API Key de OpenAI
- ✅ Variables de entorno listas

---

## 🚀 Despliegue en Vercel

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
   | `ALLOWED_EMAIL` | `fernando.etchegaray@qualivita.cl` | Production, Preview, Development |
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

---

## 🔄 Despliegues Automáticos

Vercel desplegará automáticamente:
- **Production**: Cada push a `main` o `master`
- **Preview**: Cada push a otras ramas (crea previews automáticos)

---

## 🐛 Solución de Problemas

### Error: "Environment variables not found"
- Verifica que todas las variables estén configuradas en Vercel
- Asegúrate de que estén marcadas para el ambiente correcto (Production, Preview, Development)
- Verifica que no haya espacios extra en los valores

### Error: "Build failed"
- Revisa los logs de build en Vercel
- Verifica que `package.json` tenga todas las dependencias
- Asegúrate de que no haya errores de TypeScript
- Limpia el caché de build en Vercel (Settings → General → Clear Build Cache)
- Verifica que todos los layouts tengan `metadata` exportada

### Error: "Function timeout"
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

---

## 📊 Verificación Post-Despliegue

Después del despliegue, verifica:

- [ ] La página carga correctamente
- [ ] El login funciona con ambos usuarios
- [ ] El chat responde correctamente
- [ ] La carga de archivos funciona
- [ ] La exportación a PDF funciona
- [ ] El historial se guarda correctamente

---

## 🔐 Seguridad

✅ **Verificado:**
- Archivos `.env` están en `.gitignore`
- Variables de entorno solo en Vercel
- No hay credenciales hardcodeadas en el código
- RLS configurado en Supabase

---

## 📝 Notas

- El primer despliegue puede tardar 3-5 minutos
- Los despliegues subsecuentes son más rápidos (1-2 minutos)
- Vercel tiene límites de tiempo de ejecución (30s para funciones serverless)
- Si necesitas más tiempo, considera actualizar el plan de Vercel

---

¿Problemas? Contacta a AutomatizaFix

