/**
 * Script para verificar que todas las variables de entorno necesarias estén configuradas
 * Ejecutar con: node scripts/verificar_env.js
 * 
 * Nota: Next.js carga automáticamente las variables de .env.local en desarrollo.
 * Este script lee directamente del archivo .env.local si existe.
 */

const fs = require('fs')
const path = require('path')

// Intentar cargar .env.local manualmente
function cargarEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local')
  
  if (fs.existsSync(envPath)) {
    const contenido = fs.readFileSync(envPath, 'utf8')
    const lineas = contenido.split('\n')
    
    lineas.forEach(linea => {
      const lineaTrim = linea.trim()
      // Ignorar comentarios y líneas vacías
      if (lineaTrim && !lineaTrim.startsWith('#')) {
        const igualIndex = lineaTrim.indexOf('=')
        if (igualIndex > 0) {
          const clave = lineaTrim.substring(0, igualIndex).trim()
          const valor = lineaTrim.substring(igualIndex + 1).trim()
          // Remover comillas si existen
          const valorLimpio = valor.replace(/^["']|["']$/g, '')
          if (!process.env[clave]) {
            process.env[clave] = valorLimpio
          }
        }
      }
    })
    return true
  }
  return false
}

// Cargar .env.local si existe
const envCargado = cargarEnvLocal()
if (!envCargado) {
  console.log('⚠️  No se encontró archivo .env.local')
  console.log('   El script verificará las variables del entorno del sistema\n')
}

const variablesRequeridas = {
  // Supabase - Públicas (accesibles desde el cliente)
  NEXT_PUBLIC_SUPABASE_URL: {
    descripcion: 'URL del proyecto Supabase',
    requerida: true,
    ejemplo: 'https://xxxxx.supabase.co',
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    descripcion: 'Clave anónima de Supabase',
    requerida: true,
    ejemplo: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  },
  // Supabase - Privada (solo servidor)
  SUPABASE_SERVICE_ROLE_KEY: {
    descripcion: 'Clave de servicio de Supabase (Service Role Key)',
    requerida: true,
    ejemplo: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  },
  // OpenAI
  OPENAI_API_KEY: {
    descripcion: 'Clave de API de OpenAI',
    requerida: true,
    ejemplo: 'sk-proj-...',
  },
  OPENAI_ASSISTANT_ID: {
    descripcion: 'ID del asistente de OpenAI',
    requerida: true,
    ejemplo: 'asst_6s4kpekduMglBWAJxiVdmnAy',
  },
  // Next.js
  NEXT_PUBLIC_APP_URL: {
    descripcion: 'URL de la aplicación (para enlaces de email)',
    requerida: false,
    ejemplo: 'http://localhost:3000 o https://tu-dominio.vercel.app',
  },
}

function verificarVariables() {
  console.log('\n🔍 Verificando variables de entorno...\n')
  console.log('='.repeat(70))

  const faltantes = []
  const configuradas = []
  const opcionalesFaltantes = []

  for (const [variable, info] of Object.entries(variablesRequeridas)) {
    const valor = process.env[variable]

    if (valor && valor.trim() !== '') {
      // Ocultar valores sensibles
      let valorMostrado
      if (variable.includes('KEY') || variable.includes('SECRET')) {
        valorMostrado = valor.length > 20 
          ? `${valor.substring(0, 10)}...${valor.substring(valor.length - 4)}` 
          : '***'
      } else {
        valorMostrado = valor
      }

      console.log(`✅ ${variable}`)
      console.log(`   ${info.descripcion}`)
      console.log(`   Valor: ${valorMostrado}\n`)
      configuradas.push(variable)
    } else {
      if (info.requerida) {
        console.log(`❌ ${variable} - FALTANTE (REQUERIDA)`)
        console.log(`   ${info.descripcion}`)
        console.log(`   Ejemplo: ${info.ejemplo}\n`)
        faltantes.push(variable)
      } else {
        console.log(`⚠️  ${variable} - NO CONFIGURADA (OPCIONAL)`)
        console.log(`   ${info.descripcion}`)
        console.log(`   Ejemplo: ${info.ejemplo}\n`)
        opcionalesFaltantes.push(variable)
      }
    }
  }

  console.log('='.repeat(70))
  console.log('\n📊 Resumen:\n')
  console.log(`✅ Variables configuradas: ${configuradas.length}/${Object.keys(variablesRequeridas).length}`)
  
  if (faltantes.length > 0) {
    console.log(`\n❌ Variables REQUERIDAS faltantes (${faltantes.length}):`)
    faltantes.forEach(v => console.log(`   - ${v}`))
  }

  if (opcionalesFaltantes.length > 0) {
    console.log(`\n⚠️  Variables OPCIONALES no configuradas (${opcionalesFaltantes.length}):`)
    opcionalesFaltantes.forEach(v => console.log(`   - ${v}`))
  }

  if (faltantes.length === 0) {
    console.log('\n✅ ¡Todas las variables requeridas están configuradas!')
    
    // Validaciones adicionales
    console.log('\n🔎 Validaciones adicionales:\n')
    
    // Validar formato de URL de Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
      console.log('⚠️  ADVERTENCIA: NEXT_PUBLIC_SUPABASE_URL debería comenzar con https://')
    }
    
    // Validar formato de Assistant ID
    const assistantId = process.env.OPENAI_ASSISTANT_ID
    if (assistantId && !assistantId.startsWith('asst_')) {
      console.log('⚠️  ADVERTENCIA: OPENAI_ASSISTANT_ID debería comenzar con "asst_"')
    }
    
    // Validar formato de API Key de OpenAI
    const openaiKey = process.env.OPENAI_API_KEY
    if (openaiKey && !openaiKey.startsWith('sk-')) {
      console.log('⚠️  ADVERTENCIA: OPENAI_API_KEY debería comenzar con "sk-"')
    }
    
    console.log('\n✅ Verificación completada exitosamente\n')
    return true
  } else {
    console.log('\n❌ Por favor, configura las variables faltantes en tu archivo .env.local\n')
    console.log('💡 Crea un archivo .env.local en la raíz del proyecto con:\n')
    faltantes.forEach(v => {
      const info = variablesRequeridas[v]
      console.log(`${v}=${info.ejemplo}`)
    })
    console.log('')
    return false
  }
}

// Ejecutar verificación
try {
  const exito = verificarVariables()
  process.exit(exito ? 0 : 1)
} catch (error) {
  console.error('\n❌ Error al ejecutar verificación:', error.message)
  console.log('\n💡 Asegúrate de tener dotenv instalado: npm install dotenv\n')
  process.exit(1)
}
