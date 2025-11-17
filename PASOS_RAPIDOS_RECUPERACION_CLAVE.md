# ⚡ Pasos Rápidos: Configurar Recuperación de Contraseña

## 🚨 Si la página queda en blanco al hacer clic en el email:

### Paso 1: Configurar Supabase (2 minutos)

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. **Authentication** → **URL Configuration**
4. En **"Redirect URLs"**, agrega:
   ```
   http://localhost:3000/restablecer-contraseña
   https://tu-dominio.vercel.app/restablecer-contraseña
   ```
5. **Save**

### Paso 2: Verificar Variable de Entorno

**En Vercel:**
- Settings → Environment Variables
- Verifica que `NEXT_PUBLIC_APP_URL` tenga tu URL de producción
- Ejemplo: `https://chat-fernando.vercel.app`

**En Desarrollo:**
- Verifica `.env.local`:
  ```
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ```

### Paso 3: Probar

1. Solicita recuperación de contraseña
2. Revisa el email
3. Haz clic en el enlace
4. Debe cargar el formulario de restablecer contraseña ✅

---

## ✅ Checklist Rápido

- [ ] URL agregada en Supabase (Authentication → URL Configuration)
- [ ] `NEXT_PUBLIC_APP_URL` configurada correctamente
- [ ] Probar flujo completo

---

**¿Sigue sin funcionar?** Revisa la consola del navegador (F12) para ver errores específicos.


