# Estrategia de Calidad y Automatización — StudyTracker

Documento de calidad del proyecto **StudyTracker**, una aplicación web de gestión de
tareas de estudio (React + Vite + Supabase) desplegada en Vercel.

El objetivo es garantizar que cada cambio que llega a `main` pase por validaciones
automáticas (linting, tests y build) antes de desplegarse a producción, reduciendo la
posibilidad de introducir errores.

---

## 1. Estrategia general

La calidad se asegura en dos planos que se complementan:

- **Estático / preventivo:** ESLint analiza el código en cada push y PR para detectar
  errores de sintaxis, variables sin usar y malas prácticas antes de ejecutar nada.
- **Dinámico / verificación:** tests unitarios (Vitest) y end-to-end (Playwright) que
  comprueban que la lógica y el flujo principal de la aplicación funcionan.

Todo se ejecuta de forma automática en **GitHub Actions** en cada `push` y cada
`pull_request` hacia `main`. El **despliegue a Vercel solo ocurre si todo lo anterior
pasó**, evitando publicar una versión rota.

El trabajo se organiza con **ramas + Pull Requests**: no se hace merge directo a `main`,
cada cambio se revisa y se aprueba antes de integrarse.

---

## 2. Herramientas elegidas

| Herramienta | Rol | Por qué |
|---|---|---|
| **ESLint** | Análisis estático | Detecta errores y código muerto sin ejecutar la app |
| **Vitest** | Tests unitarios | Rápido, integrado con Vite, misma config del proyecto |
| **Playwright** | Tests E2E | Prueba la app real en un navegador, levantando un servidor |
| **GitHub Actions** | CI/CD | Automatiza lint → test → build → deploy en cada cambio |
| **Vercel** | Hosting / deploy | Deploy continuo de la SPA, integrado al pipeline |
| **Supabase** | Auth + Base de datos | Backend serverless (autenticación y persistencia) |

---

## 3. Tests implementados

### Unitarios (Vitest) — `src/tests/`
- **`taskFilter.test.js`** — verifica que el filtro de tareas **completadas** devuelve
  únicamente las tareas con `completed: true`.
- **`taskPending.test.js`** — verifica que el filtro de tareas **pendientes** devuelve
  únicamente las tareas con `completed: false`.

Ambos cubren la lógica de filtrado, que es la base de las vistas "Todos / Pendientes /
Completadas" y de los contadores de progreso.

### End-to-end (Playwright) — `src/e2e/`
- **`login.spec.js`** — levanta la aplicación y verifica que la pantalla de
  autenticación carga correctamente (encabezado "Crear cuenta" visible).

Para que el E2E funcione en CI, Playwright levanta automáticamente el servidor de
desarrollo (`webServer` en `playwright.config.js`) antes de correr las pruebas.

---

## 4. Casos críticos cubiertos

- **Filtrado de tareas:** completadas vs. pendientes (tests unitarios). Es la lógica que
  alimenta los contadores y los filtros de la UI.
- **Carga de la app / autenticación:** la pantalla de auth renderiza correctamente
  (test E2E). Valida que la app arranca y que la integración con Supabase no rompe el
  render inicial.
- **Integridad del build:** `npm run build` debe completar sin errores antes de desplegar.

---

## 5. Pipeline (CI/CD)

Definido en `.github/workflows/ci.yml`, se dispara en cada `push` y `pull_request` a `main`:

```
lint  →  tests unitarios (Vitest)  →  e2e (Playwright)  →  build  →  deploy (Vercel)
```

- Los pasos corren en la subcarpeta `AplicacionServerless/` (`working-directory`).
- Las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` se inyectan desde
  **GitHub Secrets**, no se versionan.
- El job **`deploy`** declara `needs: build` y la condición
  `if: github.event_name == 'push' && github.ref == 'refs/heads/main'`, de modo que el
  despliegue a producción **solo se ejecuta si lint, tests y build pasaron, y únicamente
  cuando el cambio ya está en `main`** (no en los Pull Requests).

Secrets requeridos por el pipeline:
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`,
`VERCEL_PROJECT_ID`.

---

## 6. Flujo de trabajo en GitHub

- Una **rama** por cambio (`fix/...`, `chore/...`, `docs/...`).
- Cada rama se integra mediante un **Pull Request** que referencia su **Issue**.
- **`main` está protegida**: no se permite push directo y cada PR requiere al menos una
  **aprobación** antes de poder mergearse.
- Las revisiones quedan registradas como comentarios y aprobaciones en cada PR.

---

## 7. Limitaciones

- No se mide **cobertura de código** (coverage); los tests cubren la lógica central y el
  flujo principal, no la totalidad de la app.
- Los tests **E2E cubren solo el camino feliz** (carga de la pantalla de auth); no se
  prueban registro, login real, ni el CRUD completo de tareas de punta a punta.
- No hay **monitoreo de errores** en producción (ej. Sentry) ni alertas.
- No hay tests de **regresión visual** ni de accesibilidad.

---

## 8. Deuda técnica

- Ampliar los tests unitarios al CRUD de tareas (agregar, completar, eliminar) y a la
  validación de usuarios.
- Sumar casos E2E para registro, login y logout reales contra un entorno de prueba.
- Incorporar reporte de cobertura y un umbral mínimo en el pipeline.
- Rotar la anon key de Supabase que quedó en el historial de commits y mover toda la
  configuración sensible a Secrets (en proceso).
- Evaluar agregar un entorno de *preview* en Vercel para revisar PRs antes del merge.
