# 🧪 Guía de Testing - Chat Fernando

Esta guía te ayudará a realizar pruebas exhaustivas del sistema para asegurar que todo funcione correctamente.

## 🎯 Escenarios de Prueba

### Escenario 1: Flujo Completo de Usuario Permitido

**Objetivo:** Verificar que un usuario permitido puede usar el sistema completo.

**Preparación:**
1. Asegúrate de que el usuario esté en `usuarios_permitidos` con `activo = true`
2. Asegúrate de que el usuario exista en Supabase Auth

**Pasos:**
1. ✅ Abre `http://localhost:3000`
2. ✅ Debe redirigir a `/login`
3. ✅ Ingresa email y contraseña del usuario permitido
4. ✅ Haz clic en "Iniciar sesión"
5. ✅ Debe redirigir a `/dashboard`
6. ✅ Debe mostrar el sidebar con el perfil
7. ✅ Debe mostrar la lista de conversaciones
8. ✅ Crea una nueva conversación
9. ✅ Envía un mensaje de prueba
10. ✅ Verifica que recibas respuesta del asistente
11. ✅ Exporta la conversación a PDF
12. ✅ Cierra sesión

**Resultado esperado:** ✅ Todo funciona correctamente

---

### Escenario 2: Bloqueo de Usuario No Permitido

**Objetivo:** Verificar que un usuario no permitido NO puede acceder.

**Preparación:**
1. Crea un usuario en Supabase Auth (pero NO lo agregues a `usuarios_permitidos`)
2. O usa un email que no esté en la tabla

**Pasos:**
1. ✅ Abre `http://localhost:3000`
2. ✅ Ingresa email y contraseña del usuario NO permitido
3. ✅ Haz clic en "Iniciar sesión"

**Resultado esperado:** 
- ❌ Debe mostrar: "Acceso denegado. Este correo no está autorizado."
- ❌ NO debe redirigir al dashboard
- ❌ NO debe permitir el acceso

---

### Escenario 3: Desactivación de Usuario Activo

**Objetivo:** Verificar que al desactivar un usuario, su sesión se cierra automáticamente.

**Preparación:**
1. Inicia sesión con un usuario permitido
2. Abre el dashboard en una pestaña

**Pasos:**
1. ✅ En otra pestaña, abre Supabase Dashboard
2. ✅ Ve a SQL Editor
3. ✅ Ejecuta:
   ```sql
   UPDATE public.usuarios_permitidos
   SET activo = false, actualizado_en = NOW()
   WHERE email = 'usuario@email.com';
   ```
4. ✅ Vuelve a la pestaña del dashboard
5. ✅ Recarga la página (F5)
6. ✅ Intenta navegar a otra ruta del dashboard
7. ✅ Intenta enviar un mensaje

**Resultado esperado:**
- ✅ Debe redirigir automáticamente a `/login?error=no_autorizado`
- ✅ Debe mostrar: "Tu acceso ha sido revocado. Por favor contacta al administrador."
- ✅ La sesión debe estar cerrada

---

### Escenario 4: Reactivación de Usuario

**Objetivo:** Verificar que al reactivar un usuario, puede volver a acceder.

**Preparación:**
1. Usuario debe estar desactivado (del escenario anterior)

**Pasos:**
1. ✅ En Supabase SQL Editor, ejecuta:
   ```sql
   UPDATE public.usuarios_permitidos
   SET activo = true, actualizado_en = NOW()
   WHERE email = 'usuario@email.com';
   ```
2. ✅ Intenta iniciar sesión nuevamente

**Resultado esperado:**
- ✅ Debe permitir el login
- ✅ Debe redirigir al dashboard correctamente
- ✅ Debe funcionar normalmente

---

### Escenario 5: Protección de Rutas de API

**Objetivo:** Verificar que las APIs rechazan usuarios no permitidos.

**Preparación:**
1. Inicia sesión con un usuario permitido
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña Network

**Pasos:**
1. ✅ Crea una conversación (observa la petición a `/api/chat/thread`)
2. ✅ Envía un mensaje (observa la petición a `/api/chat`)
3. ✅ Verifica que las respuestas sean 200 OK

**Ahora prueba con usuario no permitido:**
1. ✅ Desactiva el usuario en `usuarios_permitidos`
2. ✅ Intenta crear una conversación
3. ✅ Intenta enviar un mensaje

**Resultado esperado:**
- ✅ Las APIs deben retornar 403 Forbidden
- ✅ Debe mostrar mensaje de error apropiado

---

### Escenario 6: Verificación de Middleware

**Objetivo:** Verificar que el middleware protege las rutas correctamente.

**Pasos:**
1. ✅ Sin iniciar sesión, intenta acceder a `http://localhost:3000/dashboard`
2. ✅ Debe redirigir a `/login`
3. ✅ Inicia sesión con usuario permitido
4. ✅ Accede a `http://localhost:3000/dashboard`
5. ✅ Debe cargar correctamente
6. ✅ Desactiva el usuario en `usuarios_permitidos`
7. ✅ Recarga la página del dashboard
8. ✅ Debe redirigir a `/login?error=no_autorizado`

**Resultado esperado:**
- ✅ Rutas protegidas requieren autenticación
- ✅ Usuarios no permitidos son redirigidos
- ✅ Sesión se cierra automáticamente

---

### Escenario 7: Manejo de Errores

**Objetivo:** Verificar que los errores se manejan correctamente.

**Casos de prueba:**

1. **Email inválido:**
   - ✅ Ingresa un email mal formateado
   - ✅ Debe mostrar error de validación

2. **Contraseña incorrecta:**
   - ✅ Ingresa contraseña incorrecta
   - ✅ Debe mostrar: "Credenciales incorrectas"

3. **Usuario no existe en Auth:**
   - ✅ Usuario en `usuarios_permitidos` pero no en Supabase Auth
   - ✅ Debe mostrar error de autenticación

4. **Error de red:**
   - ✅ Desconecta internet
   - ✅ Intenta iniciar sesión
   - ✅ Debe mostrar error apropiado

**Resultado esperado:**
- ✅ Todos los errores se manejan correctamente
- ✅ Mensajes de error son claros y útiles

---

### Escenario 8: Carga de Archivos

**Objetivo:** Verificar que la carga de archivos funciona correctamente.

**Pasos:**
1. ✅ Inicia sesión con usuario permitido
2. ✅ Crea una nueva conversación
3. ✅ Intenta cargar un archivo PDF
4. ✅ Intenta cargar un archivo DOCX
5. ✅ Intenta cargar una imagen
6. ✅ Intenta cargar un archivo no permitido (ej: .exe)

**Resultado esperado:**
- ✅ Archivos permitidos se cargan correctamente
- ✅ Archivos no permitidos son rechazados
- ✅ Validación funciona correctamente

---

## 🔍 Verificaciones Adicionales

### Verificación de Consola del Navegador

1. ✅ Abre las herramientas de desarrollador (F12)
2. ✅ Ve a la pestaña Console
3. ✅ No debe haber errores en rojo
4. ✅ Solo warnings menores son aceptables

### Verificación de Network

1. ✅ Ve a la pestaña Network
2. ✅ Filtra por "Fetch/XHR"
3. ✅ Verifica que todas las peticiones tengan códigos apropiados:
   - ✅ 200 para peticiones exitosas
   - ✅ 401 para no autenticado
   - ✅ 403 para no autorizado
   - ✅ 400 para errores de validación

### Verificación de Performance

1. ✅ El login debe cargar en < 2 segundos
2. ✅ El dashboard debe cargar en < 3 segundos
3. ✅ Los mensajes deben enviarse en < 5 segundos
4. ✅ Las respuestas del asistente deben llegar en < 30 segundos

---

## 📊 Checklist de Testing

Usa este checklist para asegurarte de probar todo:

### Autenticación
- [ ] Login con usuario permitido funciona
- [ ] Login con usuario no permitido es rechazado
- [ ] Cerrar sesión funciona
- [ ] Redirección después del login funciona

### Seguridad
- [ ] Middleware protege rutas
- [ ] Layout verifica usuario permitido
- [ ] APIs verifican usuario permitido
- [ ] Desactivación cierra sesión automáticamente

### Funcionalidad
- [ ] Crear conversación funciona
- [ ] Enviar mensaje funciona
- [ ] Recibir respuesta funciona
- [ ] Cargar conversación existente funciona
- [ ] Exportar PDF funciona
- [ ] Eliminar conversación funciona
- [ ] Cargar archivos funciona

### Errores
- [ ] Errores se muestran correctamente
- [ ] Mensajes de error son claros
- [ ] No hay errores en consola
- [ ] Manejo de errores de red funciona

---

## 🐛 Problemas Comunes y Soluciones

### Problema: "Email no autorizado" pero el usuario está en la tabla

**Solución:**
1. Verifica que `activo = true` en la tabla
2. Verifica que el email coincida exactamente (case-insensitive)
3. Verifica que no haya espacios extra

### Problema: Sesión no se cierra al desactivar usuario

**Solución:**
1. Verifica que el middleware esté funcionando
2. Recarga la página para forzar verificación
3. Verifica los logs del servidor

### Problema: APIs retornan 403 pero el usuario está permitido

**Solución:**
1. Verifica que la sesión esté activa
2. Verifica que el email en la sesión coincida con el de la tabla
3. Verifica los logs del servidor

---

## 📝 Reporte de Testing

Después de completar las pruebas, completa este reporte:

**Fecha de testing:** _______________

**Tester:** _______________

**Resultados:**
- Escenario 1: [ ] ✅ PASÓ [ ] ❌ FALLÓ
- Escenario 2: [ ] ✅ PASÓ [ ] ❌ FALLÓ
- Escenario 3: [ ] ✅ PASÓ [ ] ❌ FALLÓ
- Escenario 4: [ ] ✅ PASÓ [ ] ❌ FALLÓ
- Escenario 5: [ ] ✅ PASÓ [ ] ❌ FALLÓ
- Escenario 6: [ ] ✅ PASÓ [ ] ❌ FALLÓ
- Escenario 7: [ ] ✅ PASÓ [ ] ❌ FALLÓ
- Escenario 8: [ ] ✅ PASÓ [ ] ❌ FALLÓ

**Problemas encontrados:**
_________________________________________________
_________________________________________________

**Notas adicionales:**
_________________________________________________
_________________________________________________

---

**Última actualización:** Diciembre 2024

