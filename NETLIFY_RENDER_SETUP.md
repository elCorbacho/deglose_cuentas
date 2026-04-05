# Setup Netlify + Render - deglose_cuentas

## 🎯 Objetivo Final
```
Frontend: https://tu-app.netlify.app
Backend:  https://tu-api.onrender.com
```

---

## **PASO 1: Deploy Backend en Render (3 minutos)**

### 1.1 Ve a https://render.com/dashboard

### 1.2 Click en "New" → "Web Service"

### 1.3 Conecta GitHub
- Click "Connect account" (si no está)
- Selecciona `elCorbacho` (tu usuario)
- Click en `deglose_cuentas` repo
- Click "Connect"

### 1.4 Configura el servicio

| Campo | Valor |
|-------|-------|
| **Name** | `deglose-api` |
| **Region** | Elige el más cercano (Ohio, Frankfurt, etc.) |
| **Branch** | `ui_3.0` |
| **Root Directory** | `backend/` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |

### 1.5 Agrega Environment Variables

Click "Add Environment Variable":

```
KEY: FRONTEND_URL
VALUE: https://tu-app.netlify.app
```

(Reemplaza `tu-app` con el nombre que uses en Netlify)

```
KEY: NODE_ENV
VALUE: production
```

### 1.6 Deploy

- Click "Create Web Service"
- Espera 2-3 minutos
- Verás "Live" cuando esté listo

**Copia esta URL**: `https://deglose-api.onrender.com` (o la que te muestre Render)

---

## **PASO 2: Deploy Frontend en Netlify (2 minutos)**

### 2.1 Ve a https://app.netlify.com

### 2.2 Click "Add new site" → "Import an existing project"

### 2.3 Conecta GitHub
- Click "GitHub"
- Selecciona `elCorbacho` (tu usuario)
- Busca y selecciona `deglose_cuentas`
- Click "Install and Authorize"

### 2.4 Configura el build

| Campo | Valor |
|-------|-------|
| **Team** | Tu equipo (por defecto) |
| **Repository** | deglose_cuentas |
| **Branch to deploy** | `ui_3.0` |
| **Base directory** | (déjalo en blanco) |
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |

### 2.5 Agrega Environment Variables

Antes de deployar, click "Show advanced" → "New variable":

```
Key: VITE_API_BASE_URL
Value: https://deglose-api.onrender.com
```

(Reemplaza con la URL que copiastede Render)

### 2.6 Deploy

- Click "Deploy deglose_cuentas"
- Espera 1-2 minutos
- Verás "Live" cuando esté listo

**Tu frontend está en**: `https://tu-app.netlify.app`

---

## **PASO 3: Verificar Configuración** ✅

### En Render:
1. Ve a https://render.com/dashboard
2. Click en tu servicio `deglose-api`
3. Ve a "Environment" 
4. Verifica que `FRONTEND_URL` tenga tu URL de Netlify

### En Netlify:
1. Ve a tu site en Netlify
2. Click "Site settings"
3. "Build & deploy" → "Environment"
4. Verifica `VITE_API_BASE_URL` tenga tu URL de Render

---

## **PASO 4: Probar la App** 🧪

1. Abre https://tu-app.netlify.app
2. **Intenta subir un PDF**
3. Si funciona → ✅ **Todo está bien!**

### Si tienes error CORS:

El error se vería así:
```
Access to XMLHttpRequest at 'https://deglose-api.onrender.com/...'
from origin 'https://tu-app.netlify.app' has been blocked by CORS policy
```

**Solución**:
1. Ve a Render dashboard
2. Click en `deglose-api`
3. "Environment" → Busca `FRONTEND_URL`
4. Asegúrate que sea tu URL **EXACTA** de Netlify (sin trailing slash)
5. Guarda y espera a que redeploy automáticamente

---

## **PASO 5: Auto-Deploy en el Futuro** 🚀

Ahora, cada vez que hagas push a `ui_3.0`:

```bash
git push origin ui_3.0
```

Automáticamente:
- ✅ Render recompila y deploya backend
- ✅ Netlify recompila y deploya frontend
- ✅ Tu app se actualiza en vivo (en 2-3 minutos)

---

## **URLs Importantes**

Cuando esté listo, tendrás:

```
Frontend:  https://tu-app.netlify.app
Backend:   https://deglose-api.onrender.com
GitHub:    https://github.com/elCorbacho/deglose_cuentas/tree/ui_3.0
```

---

## **Troubleshooting**

### Error: "Cannot GET /"
- **Causa**: Build no funcionó
- **Solución**: Ve a Netlify → Logs → Verifica que `npm run build` pasó

### Error: CORS
- **Causa**: `FRONTEND_URL` mal configurado en Render
- **Solución**: Copia la URL exacta de Netlify (ej: `https://deglose-cuentas.netlify.app`) SIN trailing slash

### Backend no responde
- **Causa**: Render aún está deployando
- **Solución**: Espera 3-5 minutos, recarga la página

### PDF no sube
- **Causa**: Backend no está respondiendo CORS
- **Solución**: Verifica Environment Variables en ambas plataformas

---

## **¿Listo?**

Una vez hayas seguido estos pasos:
1. ✅ Backend deployado en Render
2. ✅ Frontend deployado en Netlify
3. ✅ CORS configurado
4. ✅ Variables de entorno seteadas

¡Tu app estará LIVE! 🎉

Luego, cada push a `ui_3.0` auto-deploya todo.
