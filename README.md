# Deglose Cuentas ui 5.0

Aplicación web para analizar estados de cuenta Santander en PDF, clasificar movimientos por categoría y revisar el gasto de forma más clara.

La rama `ui_5.0` acompaña la base ya migrada a TypeScript y deja el proyecto listo para seguir iterando sobre la UI.

## Qué hace

- Sube un PDF de estado de cuenta.
- Extrae y categoriza movimientos automáticamente.
- Permite filtrar por rango de fechas.
- Muestra el total general y el desglose por categoría.
- Administra categorías desde un backend simple en Node.js.

## Stack

- Frontend: React 19 + Vite
- Backend: Node.js + Express
- API: Axios
- PDF: pdfjs-dist

## Requisitos

- Node.js 20.19+ en la rama 20, o 22.12+ (requisito de Vite 8)
- npm
- Para ejecutar desde Windows: WSL con Ubuntu y Node.js/npm instalados dentro de Ubuntu.

## Instalación

```bash
npm install
cd backend
npm install
cd ..
```

Ejecutar desde la raíz del proyecto. La instalación se realiza una vez y se repite cuando cambian las dependencias.

## Desarrollo local

Abrir dos terminales en la raíz del proyecto:

### Frontend

```bash
npm run dev
```

### Backend

```bash
cd backend
npm run dev
```

El frontend corre en `http://localhost:5173` y el backend en `http://localhost:3001`.

### Desde Windows con WSL

Los siguientes comandos se ejecutan en **PowerShell o Windows Terminal con PowerShell**, no en una terminal de Ubuntu. Se asume que la distribución se llama `Ubuntu` y que el proyecto está en `/home/histo/proyectos/deglose_cuentas`; adaptar estos valores si la instalación usa otros nombres o rutas.

**Primera instalación:** instalar las dependencias de ambas aplicaciones dentro de WSL:

```powershell
wsl -d Ubuntu -- bash -ic "cd /home/histo/proyectos/deglose_cuentas && npm install && cd backend && npm install"
```

**Terminal 1 — backend:**

```powershell
wsl -d Ubuntu -- bash -ic "cd /home/histo/proyectos/deglose_cuentas/backend && npm run dev"
```

**Terminal 2 — frontend:**

```powershell
wsl -d Ubuntu -- bash -ic "cd /home/histo/proyectos/deglose_cuentas && npm run dev"
```

Abrir **http://localhost:5173** en el navegador de Windows. Mantener ambas terminales abiertas mientras se usa la aplicación. Para detenerla, presionar `Ctrl+C` en cada terminal.

### Problemas comunes al iniciar

| Problema                                       | Qué comprobar                                                                                                                                                                                                  |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WSL no encuentra `Ubuntu`                      | Ejecutar `wsl --list --verbose` en PowerShell y usar el nombre real de la distribución. Si WSL no está instalado, completar primero la [instalación oficial](https://learn.microsoft.com/windows/wsl/install). |
| `node` o `npm` no se encuentran                | Instalar Node.js y npm dentro de Ubuntu; una instalación en Windows no reemplaza la de WSL.                                                                                                                    |
| Faltan dependencias                            | Repetir el comando de primera instalación en WSL para instalar tanto frontend como backend.                                                                                                                    |
| El navegador no abre la aplicación             | Confirmar que la terminal del frontend sigue activa y usar la URL que muestra Vite; si el puerto 5173 está ocupado, puede elegir otro.                                                                         |
| Las categorías se muestran, pero no se guardan | Revisar la terminal del backend y la URL de la API. La aplicación puede mostrar categorías cacheadas aunque el backend no esté disponible.                                                                     |

## Variables de entorno

### Frontend

```bash
VITE_API_BASE_URL=http://localhost:3001
```

### Backend

```bash
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Build

```bash
npm run build
```

## Deploy

El proyecto incluye guías para despliegue en:

- Railway
- Vercel
- Render

Revisá `DEPLOY.md`, `VERCEL_DEPLOY.md` y `NETLIFY_RENDER_SETUP.md` para los pasos específicos.

## Estructura

```text
src/        Frontend principal
backend/    API para categorías
public/     Recursos estáticos
```

## Linting y Formateo

El proyecto usa ESLint + Prettier para garantizar calidad y consistencia de código.

### Comandos disponibles

```bash
npm run lint            # Chequea el frontend (src/)
npm run lint:fix        # Auto-corrige el frontend
npm run lint:backend    # Chequea el backend (backend/)
npm run lint:backend:fix # Auto-corrige el backend
npm run format          # Chequea formato sin modificar
npm run format:fix      # Auto-formatea todo el proyecto
```

### Pre-commit automático

Al hacer `git commit`, Husky ejecuta `lint-staged` automáticamente:

- Los archivos `.ts` y `.tsx` se pasan por ESLint + Prettier.
- El commit se bloquea si hay violaciones que no se pueden auto-corregir.

Para deshabilitar el hook temporalmente (solo en local):

```bash
npx husky uninstall
```

### CI/CD

GitHub Actions corre lint y format check en cada push y pull request (`.github/workflows/lint.yml`). Los PRs con violaciones no pueden mergearse.

### IDE (VSCode)

El archivo `.vscode/settings.json` ya está incluido en el repo. Al abrir el proyecto, VSCode activa:

- Formato automático al guardar (`editor.formatOnSave`)
- Auto-fix de ESLint al guardar

Extensiones requeridas: `esbenp.prettier-vscode` y `dbaeumer.vscode-eslint`.

## Notas

- Si el backend no responde, la app usa categorías cacheadas o valores por defecto.
- La lógica de categorización vive en el frontend y se apoya en la API para persistir categorías.
