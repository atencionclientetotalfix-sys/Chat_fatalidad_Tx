# Instrucciones: Gestión de Usuarios Permitidos

## ✅ Cambios Realizados

Se ha actualizado el sistema para soportar múltiples usuarios exclusivos mediante una tabla en Supabase.

### Archivos Modificados:
1. ✅ `supabase/migrations/002_usuarios_permitidos.sql` - Nueva migración SQL
2. ✅ `types/database.ts` - Tipos TypeScript actualizados
3. ✅ `app/api/auth/verify-email/route.ts` - API actualizada para consultar BD
4. ✅ `components/auth/LoginForm.tsx` - Componente actualizado para usar API

---

## 📋 Pasos para Configurar en Supabase

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

### Paso 2: Agregar el Segundo Usuario

**Opción A: Desde SQL Editor (Recomendado)**

```sql
INSERT INTO public.usuarios_permitidos (email, nombre, activo)
VALUES ('SEGUNDO_EMAIL_AQUI@correo.com', 'Nombre Segundo Usuario', true)
ON CONFLICT (email) DO NOTHING;
```

**Reemplaza:**
- `SEGUNDO_EMAIL_AQUI@correo.com` → El email del segundo usuario
- `Nombre Segundo Usuario` → El nombre del segundo usuario

**Opción B: Desde Table Editor**

1. Ve a **Table Editor** en Supabase
2. Selecciona la tabla `usuarios_permitidos`
3. Haz clic en **Insert row**
4. Completa los campos:
   - `email`: El email del segundo usuario
   - `nombre`: El nombre (opcional)
   - `activo`: `true`
5. Guarda el registro

### Paso 3: Verificar Usuarios Permitidos

Ejecuta esta consulta para ver todos los usuarios activos:

```sql
SELECT * FROM public.usuarios_permitidos WHERE activo = true;
```

---

## 🔧 Gestión de Usuarios

### Activar/Desactivar Usuario (sin eliminar)

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

### Eliminar Usuario

```sql
DELETE FROM public.usuarios_permitidos
WHERE email = 'email@correo.com';
```

### Agregar Nuevo Usuario

```sql
INSERT INTO public.usuarios_permitidos (email, nombre, activo)
VALUES ('nuevo@correo.com', 'Nombre Nuevo Usuario', true)
ON CONFLICT (email) DO NOTHING;
```

---

## ✅ Verificación

Después de ejecutar la migración y agregar usuarios:

1. **Verifica que la tabla existe:**
   ```sql
   SELECT * FROM public.usuarios_permitidos;
   ```

2. **Prueba el login:**
   - Intenta iniciar sesión con un email NO permitido → Debe rechazar
   - Intenta iniciar sesión con un email permitido → Debe permitir (si tiene cuenta en Supabase Auth)

3. **Revisa los logs:**
   - Si hay errores, revisa la consola del navegador y los logs de Supabase

---

## 🔐 Importante

- Los usuarios deben estar **tanto en `usuarios_permitidos`** (para acceso a la app) **como en Supabase Auth** (para autenticación)
- Si un usuario está en `usuarios_permitidos` pero no en Supabase Auth, no podrá iniciar sesión
- Si un usuario está en Supabase Auth pero no en `usuarios_permitidos`, será rechazado en el login

---

## 📝 Notas

- El email se compara en minúsculas (case-insensitive)
- Solo usuarios con `activo = true` pueden acceder
- Los cambios son inmediatos (no requiere reiniciar el servidor)

---

¿Necesitas ayuda? Contacta a AutomatizaFix

