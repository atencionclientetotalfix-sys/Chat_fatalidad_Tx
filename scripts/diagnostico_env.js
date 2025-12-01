/**
 * Script de diagnóstico para verificar variables de entorno
 */

const fs = require('fs')
const path = require('path')

console.log('\n🔍 DIAGNÓSTICO DE VARIABLES DE ENTORNO\n')
console.log('='.repeat(70))

// 1. Verificar archivo .env.local
const envPath = path.join(process.cwd(), '.env.local')
console.log('\n1. Verificando archivo .env.local:')
console.log(`   Ruta: ${envPath}`)

if (fs.existsSync(envPath)) {
  console.log('   ✅ Archivo existe')
  
  const content = fs.readFileSync(envPath, 'utf8')
  const lines = content.split('\n')
  
  console.log(`   📄 Total de líneas: ${lines.length}`)
  
  // Verificar variables específicas
  const variables = {
    'NEXT_PUBLIC_SUPABASE_URL': false,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': false,
    'SUPABASE_SERVICE_ROLE_KEY': false,
    'OPENAI_API_KEY': false,
    'OPENAI_ASSISTANT_ID': false,
  }
  
  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const equalIndex = trimmed.indexOf('=')
      if (equalIndex > 0) {
        const key = trimmed.substring(0, equalIndex).trim()
        const value = trimmed.substring(equalIndex + 1).trim()
        
        if (variables.hasOwnProperty(key)) {
          variables[key] = true
          const displayValue = value.length > 30 
            ? `${value.substring(0, 30)}...` 
            : value
          console.log(`   ✅ ${key} = ${displayValue}`)
        }
      }
    }
  })
  
  console.log('\n   📊 Resumen:')
  Object.entries(variables).forEach(([key, found]) => {
    console.log(`   ${found ? '✅' : '❌'} ${key}`)
  })
  
} else {
  console.log('   ❌ Archivo NO existe')
  console.log('\n   💡 Crea el archivo .env.local en la raíz del proyecto')
}

// 2. Verificar variables en process.env
console.log('\n2. Verificando variables en process.env:')
const envVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'OPENAI_ASSISTANT_ID',
]

envVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    const displayValue = value.length > 30 
      ? `${value.substring(0, 30)}...` 
      : value
    console.log(`   ✅ ${varName} = ${displayValue}`)
  } else {
    console.log(`   ❌ ${varName} = undefined`)
  }
})

// 3. Verificar otros archivos .env
console.log('\n3. Buscando otros archivos .env:')
const rootDir = process.cwd()
const files = fs.readdirSync(rootDir)
const envFiles = files.filter(f => f.startsWith('.env'))

if (envFiles.length > 0) {
  envFiles.forEach(file => {
    console.log(`   📄 ${file}`)
  })
} else {
  console.log('   ℹ️  No se encontraron otros archivos .env')
}

console.log('\n' + '='.repeat(70))
console.log('\n💡 RECOMENDACIONES:')
console.log('   1. Asegúrate de que .env.local esté en la raíz del proyecto')
console.log('   2. Reinicia el servidor después de crear/modificar .env.local')
console.log('   3. Las variables NEXT_PUBLIC_* se exponen al navegador')
console.log('   4. Ejecuta: npm run dev (después de crear .env.local)\n')
