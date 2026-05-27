# StudyTracker

Aplicación serverless desarrollada con React, Vite y Supabase que permite a los usuarios registrarse, iniciar sesión y administrar tareas personales almacenadas en la nube.

---

# Funcionalidades

## Autenticación
- Registro de usuarios
- Inicio de sesión
- Cierre de sesión
- Persistencia de sesión
- Validación de emails duplicados
- Mostrar y ocultar contraseña

## Gestión de tareas
- Crear tareas dinámicamente
- Visualizar tareas
- Marcar tareas como completadas
- Eliminar tareas
- Filtrar tareas:
  - Todas
  - Completadas
  - Pendientes
- Borrar todas las tareas
- Completar todas las tareas

## Interfaz
- Dark mode
- Menú lateral
- Mensajes dinámicos en pantalla
- Animaciones al interactuar
- Bienvenida personalizada según el usuario

---

# Tecnologías utilizadas

## Frontend
- React
- Vite
- CSS

## Backend / Cloud
- Supabase
  - Authentication
  - PostgreSQL Database
  - Row Level Security (RLS)

## Control de versiones
- Git
- GitHub
- Branching
- Pull Requests
- Conventional Commits

---

# Estructura del proyecto

```bash
src/
│
├── App.jsx
├── App.css
├── main.jsx
├── supabase.js
│
├── assets/
