# Asistente HS Etchegaray

Aplicación web exclusiva para el Sr. Fernando Etchegaray S., diseñada para proporcionar acceso a chats conversacionales con la API de OpenAI, específicamente enfocada en el chat "Control de Fatalidad TX" para asistencia en seguridad laboral y salud ocupacional.

## 🚀 Características

- **Autenticación exclusiva**: Sistema de usuarios permitidos gestionado desde Supabase
- **Múltiples usuarios**: Soporte para múltiples usuarios exclusivos mediante tabla `usuarios_permitidos`
- **Chat conversacional**: Integración con OpenAI Assistant API
- **Control de Fatalidad TX**: Chat especializado en seguridad laboral y salud ocupacional para obras eléctricas de transmisión
- **Tema oscuro**: Diseño sobrio con colores personalizados
- **Carga de archivos**: Soporte para PDF, DOCX, imágenes, Excel y otros formatos
- **Historial persistente**: Conversaciones guardadas en Supabase
- **Exportación a PDF**: Descarga de conversaciones con timestamps
- **Sidebar**: Navegación con lista de chats, perfil y configuración

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 (App Router) con TypeScript
- **UI**: React + Tailwind CSS + Lucide React
- **Autenticación**: Supabase Auth
- **Base de datos**: Supabase (PostgreSQL)
- **API**: OpenAI Assistant API
- **Hosting**: Vercel (recomendado)

## 📦 Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd asistentehsetchegaray
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear archivo `.env.local` basado en `.env.example`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=tu_openai_api_key
OPENAI_ASSISTANT_ID=asst_6s4kpekduMglBWAJxiVdmnAy

# Email permitido
ALLOWED_EMAIL=fernando.etchegaray@qualivita.cl

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Configurar Supabase:
   - Crear proyecto en [Supabase](https://supabase.com)
   - Ejecutar la migración SQL en `supabase/migrations/001_initial_schema.sql`
   - Ejecutar la migración SQL en `supabase/migrations/002_usuarios_permitidos.sql` (para usuarios permitidos)
   - Configurar Row Level Security (RLS) según las políticas en las migraciones
   - Agregar usuarios permitidos en la tabla `usuarios_permitidos` (ver `INSTRUCCIONES_USUARIOS_PERMITIDOS.md`)

5. Ejecutar en desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
asistentehsetchegaray/
├── app/                    # Rutas y páginas de Next.js
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/      # Rutas del dashboard
│   └── api/              # API routes
├── components/            # Componentes React
│   ├── ui/               # Componentes UI base
│   ├── chat/             # Componentes de chat
│   ├── sidebar/          # Componentes del sidebar
│   └── auth/             # Componentes de autenticación
├── lib/                   # Utilidades y configuraciones
│   ├── supabase/         # Clientes de Supabase
│   ├── openai/           # Configuración de OpenAI
│   └── utils/             # Utilidades generales
├── types/                 # Definiciones de TypeScript
└── supabase/              # Migraciones de base de datos
```

## 🎨 Colores del Tema

- **Base**: `#12080A` (negro oscuro)
- **Primary**: `#FF857B` (coral/rojo claro)
- **Secondary**: `#E97D46` (naranja)
- **Accent**: `#CE65A3` (rosa/magenta)

## 🔐 Seguridad

- **Autenticación exclusiva por email**: Sistema de usuarios permitidos mediante tabla `usuarios_permitidos` en Supabase
- **Verificación multicapa**: 
  - Verificación en el login (antes de autenticarse)
  - Verificación en el middleware (protección de rutas)
  - Verificación en el layout del dashboard (capa adicional)
  - Verificación en todas las rutas de API
- **API keys almacenadas en variables de entorno del servidor**
- **Row Level Security (RLS) en Supabase**: Políticas de seguridad a nivel de base de datos
- **Validación de archivos antes de subir**: Verificación de tipo y tamaño
- **Rate limiting**: Implementado en todas las rutas de API críticas
- **Cierre automático de sesión**: Si un usuario es desactivado, su sesión se cierra automáticamente

## 📝 Funcionalidades del Chat

### Control de Fatalidad TX
El asistente está configurado como experto en:
- Seguridad laboral y salud ocupacional
- Obras de construcción eléctrica de transmisión en Chile
- Normas de control de riesgos de fatalidad del grupo SAESA
- Interpretación de normas y procedimientos
- Análisis de riesgos y recomendaciones

### Características:
- Streaming de respuestas
- Carga de archivos (PDF, DOCX, imágenes, Excel)
- Historial persistente
- Exportación a PDF con timestamps
- Múltiples conversaciones

## 🚢 Despliegue

### Vercel (Recomendado)

1. **Conectar el repositorio:**
   - Ve a [Vercel Dashboard](https://vercel.com/dashboard)
   - Haz clic en "Add New Project"
   - Importa el repositorio de GitHub: `https://github.com/atencionclientetotalfix-sys/Chat_fatalidad_Tx.git`
   - Vercel detectará automáticamente Next.js

2. **Configurar variables de entorno:**
   En el dashboard de Vercel, ve a Settings → Environment Variables y agrega:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key
   OPENAI_API_KEY=tu_openai_api_key
   OPENAI_ASSISTANT_ID=asst_6s4kpekduMglBWAJxiVdmnAy
   ALLOWED_EMAIL=fernando.etchegaray@qualivita.cl
   NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
   ```

3. **Configurar dominio:**
   - En Project Settings → Domains
   - Agrega tu dominio personalizado si lo tienes

4. **Desplegar:**
   - Vercel desplegará automáticamente en cada push a `main`
   - O haz clic en "Deploy" para el primer despliegue

### Variables de entorno en producción:
⚠️ **IMPORTANTE**: Asegúrate de configurar todas las variables de entorno en Vercel. No uses archivos `.env` en producción.

### Build y Deploy

El proyecto está configurado con:
- `vercel.json` para configuración optimizada de Vercel
- `next.config.js` con optimizaciones para producción
- Configuración de funciones serverless con timeout extendido
- Metadata en layouts para asegurar generación correcta de manifiestos en Next.js 14

### Solución de Errores de Build

Si encuentras el error `ENOENT: no such file or directory, lstat '/vercel/path0/.next/server/app/(dashboard)/page_client-reference-manifest.js'`:

1. **Verificar metadata en layouts**: Asegúrate de que todos los layouts tengan metadata exportada
2. **Limpiar caché de build**: En Vercel, usa "Clear Build Cache" antes de desplegar
3. **Verificar estructura de archivos**: Asegúrate de que todos los archivos `page.tsx` tengan contenido válido
4. **Reinstalar dependencias**: Si el problema persiste, elimina `node_modules` y `package-lock.json`, luego ejecuta `npm install`

## 👨‍💻 Desarrollo

Desarrollado por **AutomatizaFix**
- Sitio web: [www.automatizafix.com](https://www.automatizafix.com)

## 📄 Licencia

Este proyecto es privado y exclusivo para el Sr. Fernando Etchegaray S.

## 🔄 Actualizaciones Recientes

### Mejoras de Seguridad (Última actualización)

- ✅ **Sistema de verificación multicapa**: Implementada verificación de usuarios permitidos en múltiples capas:
  - Middleware: Verifica acceso antes de permitir entrada a rutas protegidas
  - Layout del dashboard: Verificación adicional al cargar el dashboard
  - Rutas de API: Todas las rutas verifican que el usuario esté permitido
- ✅ **Función helper reutilizable**: Creada `lib/utils/auth-helper.ts` para centralizar la lógica de verificación
- ✅ **Cierre automático de sesión**: Si un usuario es desactivado en `usuarios_permitidos`, su sesión se cierra automáticamente
- ✅ **Mejoras en manejo de errores**: Mejor gestión de errores en todas las rutas de API

### Documentación y Herramientas de Verificación

- ✅ **Guías de verificación**: Creadas guías completas para verificar el sistema
  - `GUIA_VERIFICACION.md` - Guía paso a paso de verificación
  - `CHECKLIST_VERIFICACION.md` - Checklist de verificación
  - `TESTING.md` - Guía de testing con escenarios de prueba
  - `RESUMEN_VERIFICACION.md` - Resumen ejecutivo de verificaciones
- ✅ **Scripts de verificación**: Scripts automatizados para verificar configuración
  - `backend/scripts/verificar_configuracion.py` - Script Python de verificación
  - `supabase/verificar_migraciones.sql` - Script SQL de verificación

### Funcionalidades Actuales

- Sistema de autenticación con Supabase Auth
- Gestión de usuarios permitidos mediante tabla en Supabase
- Chat conversacional con OpenAI Assistant API
- Historial persistente de conversaciones
- Exportación a PDF
- Carga de archivos (PDF, DOCX, imágenes, Excel)
- Rate limiting en todas las rutas críticas

## 🔄 Actualizaciones Futuras

- Soporte para múltiples chats adicionales
- Mejoras en la interfaz de usuario
- Funcionalidades adicionales según necesidades

---

**Nota**: Este proyecto requiere configuración de Supabase y OpenAI para funcionar correctamente. Asegúrate de tener todas las credenciales necesarias antes de desplegar.

