# Deploy con Vercel (Gratuito) ✅

## 🎯 Objetivo
- **Frontend en Vercel** (gratis, ilimitado)
- **Backend en Vercel Serverless Functions** (gratis)

## Ventajas
- ✅ 100% GRATIS
- ✅ Sin tarjeta de crédito
- ✅ Auto-deploy en cada push
- ✅ HTTPS automático
- ✅ CDN global

---

## PASO 1: Deploy Frontend en Vercel

### 1.1 Ve a https://vercel.com/dashboard

### 1.2 Click "Add New..." → "Project"

### 1.3 Selecciona "Import Git Repository"
- Busca `deglose_cuentas`
- Click "Import"

### 1.4 Configura el proyecto
```
Framework Preset: Vite
Root Directory: . (déjalo por defecto)
Build Command: npm run build
Output Directory: dist
```

### 1.5 Agrega Variables de Entorno
Antes de deploy, en "Environment Variables":
```
Key: VITE_API_BASE_URL
Value: (VEREMOS DESPUÉS cuando tengamos la URL del backend)
```

Por ahora déjalo como: `http://localhost:3001` (o sin poner nada)

### 1.6 Deploy
- Click "Deploy"
- Espera 2-3 minutos
- ¡Listo! Frontend en Vercel

URL: https://deglose-cuentas-tuusuario.vercel.app

---

## PASO 2: Migrar Backend a Vercel API Routes

Vercel tiene "Serverless Functions" gratis. Vamos a usar eso.

### 2.1 Estructura nueva

Crea esta estructura en tu proyecto:

```
vercel.json (en la raíz)
api/
  └── categories.js (tu ruta de categorías)
```

### 2.2 Convierte tu backend Express a Vercel Functions

**En lugar de:**
```javascript
app.use('/api/categories', categoriesRouter);
```

**Usa Vercel functions**:
- Copia `backend/routes/categories.js` a `api/categories.js`
- Ajusta los imports

### 2.3 vercel.json

Crea archivo `vercel.json` en la raíz:

```json
{
  "buildCommand": "npm run build",
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs20.x"
    }
  },
  "redirects": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

### 2.4 Deploy nuevamente
- Git push
- Vercel auto-deploya
- API en: https://tu-domain.vercel.app/api/categories

---

## ALTERNATIVA SIMPLE: Backend en otra plataforma

Si no quieres migrar el backend, puedes:

1. **Vercel**: Solo frontend (como arriba)
2. **Heroku** (con tarjeta, gratis primeros meses) o **Railway** (con créditos) para backend

Pero **la opción más simple es TODO en Vercel**.

---

## Recomendación Final

**Usa Vercel para TODO**:
1. Frontend → Vercel (gratis)
2. Backend → Vercel API Routes (gratis)
3. Database → PostgreSQL en Vercel (gratis con límites)

Total: **100% GRATIS**, una sola plataforma, muy fácil.

¿Vamos con eso?
