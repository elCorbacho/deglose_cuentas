# Deploy Guide - deglose_cuentas

## Opción 1: Railway.app (RECOMENDADO)

### Paso 1: Crear Proyecto en Railway
1. Ve a https://railway.app
2. Sign up con GitHub
3. New Project → GitHub Repo (deglose_cuentas)

### Paso 2: Crear Dos Servicios

#### Servicio 1: Frontend (React + Vite)
```bash
# En Railway:
# 1. New Service → GitHub
# 2. Selecciona deglose_cuentas repo
# 3. Root directory: . (raíz)
# 4. Variables de entorno:
VITE_API_BASE_URL=https://tu-backend-url.railway.app
```

Build Command: `npm run build`
Start Command: `npm run preview`

#### Servicio 2: Backend (Node.js)
```bash
# En Railway:
# 1. New Service → GitHub
# 2. Selecciona deglose_cuentas repo
# 3. Root directory: backend/
# 4. Variables de entorno:
NODE_ENV=production
PORT=$PORT (Railway lo asigna)
```

Build Command: `npm install`
Start Command: `node server.js`

---

## Opción 2: Vercel (Solo Frontend)

```bash
npm install -g vercel
vercel

# Configurar variable de entorno:
VITE_API_BASE_URL=https://tu-api.com
```

Backend: Deploya en Heroku, Railway o donde prefieras

---

## Opción 3: Docker (Para ambos)

Si quieres todo containerizado:

### Dockerfile (raíz - Frontend)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]
```

### Dockerfile (backend/)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "server.js"]
```

Luego push a Docker Hub o usa con Railway/Render

---

## Variables de Entorno Necesarias

### Frontend (.env)
```
VITE_API_BASE_URL=https://your-backend-url.com
```

### Backend (.env)
```
NODE_ENV=production
PORT=3001 (o lo que asigne Railway)
CORS_ORIGIN=https://your-frontend-url.com
```

---

## Testing Local

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm install
node server.js
```

Abre http://localhost:5173

---

## Pasos Rápidos Railway.app

1. https://railway.app → Sign up
2. New Project → GitHub
3. Conectar deglose_cuentas
4. Agregar dos servicios (frontend + backend)
5. Configurar variables de entorno
6. Deploy automático ✅

El frontend se actualiza cada vez que pushes a `ui_3.0` 🚀
