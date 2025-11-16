-- Script SQL para verificar el estado de las migraciones
-- Ejecuta este script en Supabase SQL Editor para verificar que todo esté correcto

-- ============================================
-- VERIFICACIÓN DE TABLAS
-- ============================================

-- Verificar que todas las tablas existan
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('perfiles', 'conversaciones', 'mensajes', 'usuarios_permitidos') 
        THEN '✅ EXISTE'
        ELSE '⚠️  NO REQUERIDA'
    END as estado
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('perfiles', 'conversaciones', 'mensajes', 'usuarios_permitidos')
ORDER BY table_name;

-- ============================================
-- VERIFICACIÓN DE USUARIOS PERMITIDOS
-- ============================================

-- Ver todos los usuarios permitidos
SELECT 
    id,
    email,
    nombre,
    CASE 
        WHEN activo THEN '✅ ACTIVO'
        ELSE '❌ INACTIVO'
    END as estado,
    creado_en,
    actualizado_en
FROM public.usuarios_permitidos
ORDER BY creado_en DESC;

-- Contar usuarios activos
SELECT 
    COUNT(*) FILTER (WHERE activo = true) as usuarios_activos,
    COUNT(*) FILTER (WHERE activo = false) as usuarios_inactivos,
    COUNT(*) as total_usuarios
FROM public.usuarios_permitidos;

-- ============================================
-- VERIFICACIÓN DE RLS (Row Level Security)
-- ============================================

-- Verificar que RLS esté habilitado en las tablas
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ HABILITADO'
        ELSE '❌ DESHABILITADO'
    END as rls_estado
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('perfiles', 'conversaciones', 'mensajes', 'usuarios_permitidos')
ORDER BY tablename;

-- Verificar políticas RLS existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as comando,
    qual as condicion_using,
    with_check as condicion_with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('perfiles', 'conversaciones', 'mensajes', 'usuarios_permitidos')
ORDER BY tablename, policyname;

-- ============================================
-- VERIFICACIÓN DE ÍNDICES
-- ============================================

-- Verificar índices en las tablas
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('perfiles', 'conversaciones', 'mensajes', 'usuarios_permitidos')
ORDER BY tablename, indexname;

-- ============================================
-- VERIFICACIÓN DE TRIGGERS
-- ============================================

-- Verificar trigger para crear perfil automáticamente
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
    AND trigger_name = 'on_auth_user_created';

-- ============================================
-- VERIFICACIÓN DE FUNCIONES
-- ============================================

-- Verificar función para crear perfil automáticamente
SELECT 
    routine_name,
    routine_type,
    CASE 
        WHEN routine_name = 'crear_perfil_automatico' THEN '✅ EXISTE'
        ELSE '⚠️  NO ENCONTRADA'
    END as estado
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name = 'crear_perfil_automatico';

-- ============================================
-- RESUMEN DE VERIFICACIÓN
-- ============================================

-- Resumen general
SELECT 
    'Tablas' as categoria,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) = 4 THEN '✅ COMPLETO'
        ELSE '⚠️  INCOMPLETO'
    END as estado
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('perfiles', 'conversaciones', 'mensajes', 'usuarios_permitidos')

UNION ALL

SELECT 
    'Usuarios Permitidos' as categoria,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) FILTER (WHERE activo = true) > 0 THEN '✅ HAY ACTIVOS'
        ELSE '❌ SIN ACTIVOS'
    END as estado
FROM public.usuarios_permitidos

UNION ALL

SELECT 
    'Políticas RLS' as categoria,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) >= 8 THEN '✅ SUFICIENTES'
        ELSE '⚠️  REVISAR'
    END as estado
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('perfiles', 'conversaciones', 'mensajes', 'usuarios_permitidos');

