# DEPLOYMENT STEPS - LIVE GUIDE

## 🔴 PASO 1.2: Crear Web Service en Render

1. En el dashboard, busca el botón **"New"** (arriba a la derecha)
2. Click en **"New"** → Verás un menú
3. Selecciona **"Web Service"**

---

## 🔴 PASO 1.3: Conectar GitHub

En la pantalla de crear servicio:
1. Click en **"GitHub"** (lado izquierdo)
2. Aparecerá un modal pidiendo permisos
3. Click **"Connect account"** o **"Install and Authorize"**
4. Se abrirá GitHub pidiendo que autorice a Render
5. Click **"Authorize render-oss"** o similar

---

## 🔴 PASO 1.4: Seleccionar Repositorio

Después de autorizar:
1. Verás una lista de tus repos
2. **Busca y click en: `deglose_cuentas`**
3. Click **"Connect"** al lado del repo

---

## 🔴 PASO 1.5: Configurar el Servicio

Ahora estás en la pantalla "Create a New Web Service". Llena esto:

| Campo | Valor |
|-------|-------|
| **Name** | `deglose-api` |
| **Region** | Elige uno (Ohio, Frankfurt, Singapore, etc.) |
| **Branch** | `ui_3.0` |
| **Root Directory** | `backend/` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |

**IMPORTANTE**: 
- En "Root Directory" DEBE ser `backend/` (no backend, sin slash al principio)
- Runtime DEBE ser `Node`

---

## 🔴 PASO 1.6: Agregar Variables de Entorno

Scroll hacia abajo en la misma pantalla.

1. Busca la sección **"Environment"**
2. Click **"Add Environment Variable"**
3. Agrega:

```
Key: FRONTEND_URL
Value: (DÉJALO EN BLANCO POR AHORA)
```

4. Click **"Add Environment Variable"** de nuevo
5. Agrega:

```
Key: NODE_ENV
Value: production
```

---

## 🔴 PASO 1.7: Deploy

1. Scroll hacia abajo hasta el final
2. Click el botón **"Create Web Service"** (botón azul)
3. **Espera 2-3 minutos** mientras deploya

Verás un log en vivo. Cuando diga **"Live"** en verde → ✅ Backend está online

**Copia la URL que aparece arriba** (algo como: `https://deglose-api.onrender.com`)

Dime cuando esté "Live" ✅
