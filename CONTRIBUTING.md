# Contribuir a Deglose Cuentas

## Setup inicial

```bash
npm install
npx husky install
```

El segundo comando activa los pre-commit hooks. Solo hay que correrlo una vez después de clonar.

## Pre-commit hooks

Al hacer `git commit`, Husky ejecuta automáticamente `lint-staged` sobre los archivos staged:

| Archivos     | Pasos                               |
| ------------ | ----------------------------------- |
| `*.{ts,tsx}` | `eslint --fix` → `prettier --write` |
| `*.{js,jsx}` | `eslint --fix` → `prettier --write` |
| `*.json`     | `prettier --write`                  |

Si ESLint encuentra una violación que no puede corregir automáticamente, el commit es bloqueado y se muestra el error. Corregí el problema y volvé a hacer stage + commit.

Para deshabilitar el hook solo en tu máquina (útil durante desarrollo activo):

```bash
npx husky uninstall
```

Para reactivarlo:

```bash
npx husky install
```

## CI/CD

GitHub Actions corre `.github/workflows/lint.yml` en cada push y pull request:

1. `npm ci` — instalación limpia
2. `npm run lint` — ESLint frontend
3. `npm run lint:backend` — ESLint backend
4. `npm run format` — Prettier check (sin modificar archivos)

Los PRs con alguno de estos pasos fallido **no se pueden mergear**.

## Comandos de lint y formato

```bash
npm run lint              # Chequea frontend (exit 1 si hay errores o warnings)
npm run lint:fix          # Auto-corrige frontend
npm run lint:backend      # Chequea backend
npm run lint:backend:fix  # Auto-corrige backend
npm run format            # Chequea formato sin tocar archivos
npm run format:fix        # Formatea todo el proyecto
```

El flujo recomendado antes de commitear:

```bash
npm run lint:fix && npm run lint:backend:fix && npm run format:fix
npm run lint && npm run lint:backend && npm run format
```

## IDE (VSCode)

El repositorio incluye `.vscode/settings.json`. Al abrir el proyecto, VSCode configura automáticamente:

- **Prettier** como formateador por defecto
- **Formato al guardar** (`editor.formatOnSave: true`)
- **ESLint auto-fix al guardar** para TypeScript y TSX

Extensiones necesarias:

- `esbenp.prettier-vscode`
- `dbaeumer.vscode-eslint`

## Estructura de configs

| Archivo                      | Propósito                                          |
| ---------------------------- | -------------------------------------------------- |
| `.eslintrc.json`             | ESLint para el frontend (React + TypeScript)       |
| `backend/.eslintrc.cjs`      | ESLint para el backend (Node.js + TypeScript)      |
| `.prettierrc.json`           | Reglas de formato unificadas para todo el proyecto |
| `.prettierignore`            | Archivos/directorios excluidos del formateo        |
| `.lintstagedrc.json`         | Mapeo de extensiones a comandos en pre-commit      |
| `.vscode/settings.json`      | Configuración IDE para el equipo                   |
| `.github/workflows/lint.yml` | CI que corre lint y format en cada PR              |
