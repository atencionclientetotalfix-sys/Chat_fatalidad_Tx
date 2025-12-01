# Comandos Git para Actualizar el Repositorio

## Pasos para hacer Commit y Push al Repositorio Remoto

### 1. Verificar el estado actual
```bash
git status
```

### 2. Agregar todos los cambios
```bash
git add -A
```

### 3. Verificar qué se va a commitear
```bash
git status
```

### 4. Hacer commit con mensaje descriptivo
```bash
git commit -m "Actualización completa: correcciones TypeScript, mejoras en manejo de errores y validación de variables de entorno"
```

### 5. Push al repositorio remoto (GitHub)
```bash
git push origin main
```

## Si hay problemas de autenticación

Si te pide credenciales, puedes usar:

### Opción 1: Personal Access Token (recomendado)
1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Genera un nuevo token con permisos `repo`
3. Usa el token como contraseña cuando git lo pida

### Opción 2: SSH (si está configurado)
```bash
git push origin main
```

## Verificar que se completó

```bash
git status
git log --oneline -3
```

## Comandos completos en una sola línea (PowerShell)

```powershell
cd "c:\Users\jaime\Documents\PROYECTOS_JHS_AssA\Chat_Fernando"
git add -A
git commit -m "Actualización completa: correcciones TypeScript, mejoras en manejo de errores y validación de variables de entorno"
git push origin main
```

## Comandos completos en una sola línea (Git Bash / Terminal)

```bash
cd "c:\Users\jaime\Documents\PROYECTOS_JHS_AssA\Chat_Fernando" && git add -A && git commit -m "Actualización completa: correcciones TypeScript, mejoras en manejo de errores y validación de variables de entorno" && git push origin main
```
