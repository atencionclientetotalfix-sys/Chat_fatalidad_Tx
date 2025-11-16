"""
Script para verificar la configuración del proyecto Chat Fernando
Verifica variables de entorno, conexión a Supabase y estado de la base de datos
"""

import os
import sys
from typing import Dict, List, Tuple

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ Error: No se encontró la librería supabase-py")
    print("   Instala con: pip install supabase")
    sys.exit(1)


def verificar_variables_entorno() -> Tuple[bool, List[str]]:
    """Verifica que todas las variables de entorno necesarias estén configuradas"""
    variables_requeridas = {
        'NEXT_PUBLIC_SUPABASE_URL': 'URL del proyecto Supabase',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Clave anónima de Supabase',
        'SUPABASE_SERVICE_ROLE_KEY': 'Clave de servicio de Supabase',
        'OPENAI_API_KEY': 'Clave de API de OpenAI',
        'OPENAI_ASSISTANT_ID': 'ID del asistente de OpenAI',
    }
    
    faltantes = []
    configuradas = []
    
    print("\n📋 Verificando variables de entorno...")
    print("-" * 60)
    
    for var, descripcion in variables_requeridas.items():
        valor = os.getenv(var)
        if valor:
            # Ocultar valores sensibles
            if 'KEY' in var or 'SECRET' in var:
                valor_mostrado = valor[:10] + "..." if len(valor) > 10 else "***"
            else:
                valor_mostrado = valor
            print(f"✅ {var}: {valor_mostrado}")
            configuradas.append(var)
        else:
            print(f"❌ {var}: NO CONFIGURADA - {descripcion}")
            faltantes.append(var)
    
    return len(faltantes) == 0, faltantes


def verificar_conexion_supabase() -> Tuple[bool, Client]:
    """Verifica la conexión a Supabase"""
    print("\n🔌 Verificando conexión a Supabase...")
    print("-" * 60)
    
    url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not url or not key:
        print("❌ No se pueden verificar las credenciales de Supabase")
        return False, None
    
    try:
        supabase: Client = create_client(url, key)
        # Intentar una consulta simple
        resultado = supabase.table('usuarios_permitidos').select('count').execute()
        print("✅ Conexión a Supabase exitosa")
        return True, supabase
    except Exception as e:
        print(f"❌ Error al conectar con Supabase: {str(e)}")
        return False, None


def verificar_tablas(supabase: Client) -> Dict[str, bool]:
    """Verifica que todas las tablas necesarias existan"""
    print("\n📊 Verificando tablas en la base de datos...")
    print("-" * 60)
    
    tablas_requeridas = [
        'perfiles',
        'conversaciones',
        'mensajes',
        'usuarios_permitidos'
    ]
    
    resultados = {}
    
    for tabla in tablas_requeridas:
        try:
            # Intentar hacer una consulta simple
            supabase.table(tabla).select('*').limit(1).execute()
            print(f"✅ Tabla '{tabla}' existe y es accesible")
            resultados[tabla] = True
        except Exception as e:
            print(f"❌ Tabla '{tabla}' no existe o no es accesible: {str(e)}")
            resultados[tabla] = False
    
    return resultados


def verificar_usuarios_permitidos(supabase: Client) -> Tuple[bool, List[Dict]]:
    """Verifica los usuarios permitidos en la base de datos"""
    print("\n👥 Verificando usuarios permitidos...")
    print("-" * 60)
    
    try:
        resultado = supabase.table('usuarios_permitidos').select('*').execute()
        usuarios = resultado.data if resultado.data else []
        
        if len(usuarios) == 0:
            print("⚠️  No hay usuarios permitidos en la base de datos")
            return False, []
        
        print(f"✅ Se encontraron {len(usuarios)} usuario(s) permitido(s):")
        for usuario in usuarios:
            estado = "✅ ACTIVO" if usuario.get('activo', False) else "❌ INACTIVO"
            print(f"   - {usuario.get('email', 'N/A')} ({usuario.get('nombre', 'Sin nombre')}) - {estado}")
        
        activos = [u for u in usuarios if u.get('activo', False)]
        if len(activos) == 0:
            print("⚠️  No hay usuarios activos")
            return False, usuarios
        
        return True, usuarios
    except Exception as e:
        print(f"❌ Error al verificar usuarios permitidos: {str(e)}")
        return False, []


def verificar_politicas_rls(supabase: Client) -> bool:
    """Verifica que las políticas RLS estén habilitadas"""
    print("\n🔒 Verificando políticas RLS...")
    print("-" * 60)
    
    # Esta verificación requiere consultas SQL directas
    # Por ahora, solo verificamos que las tablas existan
    print("ℹ️  Las políticas RLS deben verificarse manualmente en Supabase Dashboard")
    print("   Ve a: Authentication > Policies")
    return True


def main():
    """Función principal de verificación"""
    print("=" * 60)
    print("🔍 VERIFICACIÓN DE CONFIGURACIÓN - Chat Fernando")
    print("=" * 60)
    
    # Verificar variables de entorno
    env_ok, faltantes = verificar_variables_entorno()
    if not env_ok:
        print(f"\n❌ Faltan {len(faltantes)} variable(s) de entorno")
        print("   Configura las variables en tu archivo .env.local")
        return 1
    
    # Verificar conexión a Supabase
    conexion_ok, supabase = verificar_conexion_supabase()
    if not conexion_ok:
        print("\n❌ No se pudo conectar a Supabase")
        return 1
    
    # Verificar tablas
    tablas_ok = verificar_tablas(supabase)
    if not all(tablas_ok.values()):
        print("\n❌ Algunas tablas no existen o no son accesibles")
        print("   Ejecuta las migraciones SQL en Supabase Dashboard")
        return 1
    
    # Verificar usuarios permitidos
    usuarios_ok, usuarios = verificar_usuarios_permitidos(supabase)
    if not usuarios_ok:
        print("\n⚠️  No hay usuarios permitidos activos")
        print("   Agrega usuarios en la tabla 'usuarios_permitidos'")
    
    # Verificar políticas RLS
    verificar_politicas_rls(supabase)
    
    # Resumen
    print("\n" + "=" * 60)
    print("📋 RESUMEN")
    print("=" * 60)
    
    if env_ok and conexion_ok and all(tablas_ok.values()) and usuarios_ok:
        print("✅ Todas las verificaciones pasaron correctamente")
        print("\n✅ El sistema está listo para usar")
        return 0
    else:
        print("⚠️  Algunas verificaciones fallaron")
        print("\n📝 Revisa los errores anteriores y corrige los problemas")
        return 1


if __name__ == '__main__':
    # Cargar variables de entorno desde .env.local si existe
    try:
        from dotenv import load_dotenv
        load_dotenv('.env.local')
    except ImportError:
        pass
    
    sys.exit(main())

