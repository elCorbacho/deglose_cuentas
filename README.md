# Deglose Cuentas ui 4.0 esta es la nueva UI


Aplicación web para analizar estados de cuenta Santander en PDF, clasificar movimientos por categoría y revisar el gasto de forma más clara.

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

- Node.js 20 o superior
- npm

## Instalación

```bash
npm install
cd backend
npm install
```

## Desarrollo local

Abrí dos terminales:

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

## Notas

- Si el backend no responde, la app usa categorías cacheadas o valores por defecto.
- La lógica de categorización vive en el frontend y se apoya en la API para persistir categorías.