# Deploy Gratis - deglose_cuentas

## 🌟 MEJOR OPCIÓN: Vercel (Frontend) + Railway (Backend)

### Frontend en Vercel (GRATIS)
**Límites gratis**: 100 GB/mes de bandwidth
- ✅ Actualización automática con git push
- ✅ HTTPS automático
- ✅ CDN global

**Pasos**:
```bash
1. Ve a https://vercel.com
2. Sign up con GitHub
3. Import deglose_cuentas
4. Add Environment Variable:
   VITE_API_BASE_URL=https://tu-backend.railway.app
5. Deploy ✅
```

### Backend en Railway (GRATIS - con créditos)
**Límites gratis**: $5 USD/mes de créditos (luego te piden tarjeta)
- ✅ Gratis por 1-2 meses (dependiendo uso)
- ✅ Si baja tráfico, sigues gratis indefinido

**Pasos**:
```bash
1. Ve a https://railway.app
2. Sign up con GitHub
3. New Project → deglose_cuentas
4. Root directory: backend/
5. Add Environment Variable:
   NODE_ENV=production
6. Deploy ✅
```

**COSTO TOTAL**: 100% GRATIS (primeros meses)

---

## 🟦 ALTERNATIVA: Netlify (Frontend) + Render (Backend)

### Frontend en Netlify (GRATIS)
- ✅ Completamente gratis
- ✅ Incluye serverless functions (si los necesitas)
- ✅ Muy confiable

**Pasos**:
```bash
1. https://netlify.com → Sign up con GitHub
2. New site from Git → deglose_cuentas
3. Environment Variables:
   VITE_API_BASE_URL=https://tu-api.render.com
4. Deploy ✅
```

### Backend en Render (GRATIS)
- ✅ Gratis si tienes poco tráfico
- ✅ Si no hay requests, no cuesta nada
- ✅ Spin down automático (duerme cuando no lo usas)

**Pasos**:
```bash
1. https://render.com → Sign up con GitHub
2. New → Web Service
3. Conecta repo, root: backend/
4. Environment: Node
5. Build: npm install
6. Start: node server.js
7. Deploy ✅
```

**COSTO TOTAL**: 100% GRATIS

---

## 🟢 OPCIÓN 3: Heroku (Frontend + Backend) - GRATIS?

⚠️ **Heroku cambió modelo**: Ya NO es gratis desde Noviembre 2022
- ❌ Requiere tarjeta de crédito
- ❌ $5-7 USD/mes mínimo

**NO RECOMENDADO** para gratis puro

---

## 🟠 OPCIÓN 4: Glitch (Muy Fácil)

**Frontend + Backend en UNO**
- ✅ Remixea el proyecto
- ✅ Edita en el navegador
- ✅ 1000 horas/mes GRATIS

**Pasos**:
```bash
1. https://glitch.com
2. New Project → Import from GitHub
3. Selecciona deglose_cuentas
4. Edita server.js para servir frontend también
5. ¡Listo!
```

**Limitación**: Se duerme si no hay activity (demora 5s al reactivar)

---

## 🔵 OPCIÓN 5: GitHub Pages (Solo Frontend)

- ✅ Completamente gratis
- ✅ Ilimitado
- ❌ Solo hosting estático (sin backend)

Si el backend está en otro lado, esto funciona perfecto

**Pasos**:
```bash
1. npm run build
2. Push dist/ a gh-pages branch
3. Activa GitHub Pages en Settings
4. ¡Listo!
```

---

## 🎯 MI RECOMENDACIÓN: Vercel + Railway

| Aspecto | Vercel | Railway |
|---------|--------|---------|
| **Precio** | Gratis | $5 USD/mo (gratis el primer mes) |
| **Setup** | 2 minutos | 3 minutos |
| **Autoreparación** | ✅ | ✅ |
| **Auto-deploy** | ✅ | ✅ |
| **Performance** | Excelente | Muy bueno |
| **Soporte** | Bueno | Muy bueno |

**Total**: Gratis + $5 = **$5 USD/mes** (luego pueden bajar si baja tráfico)

---

## 🚀 MEJOR OPCIÓN GRATIS PURA: Netlify + Render

| Aspecto | Netlify | Render |
|---------|---------|--------|
| **Precio** | 100% Gratis | 100% Gratis |
| **Setup** | 2 minutos | 3 minutos |
| **Auto-deploy** | ✅ | ✅ |
| **Limitaciones** | Mínimas | Sleep mode si inactivo |

**Total**: **100% GRATIS PARA SIEMPRE**

**ÚNICA limitación**: Render duerme la app si nadie la usa (se reactiva en 30s)

---

## 📊 COMPARATIVA RÁPIDA

```
┌─────────────────┬────────┬──────────┬─────────────┐
│ Plataforma      │ Precio │ Frontend │ Backend     │
├─────────────────┼────────┼──────────┼─────────────┤
│ Vercel + Railway│ $5/mo  │ ✅       │ ✅          │
│ Netlify + Render│ Gratis │ ✅       │ ✅          │
│ Glitch          │ Gratis │ ✅ (uno) │ ✅ (uno)    │
│ GitHub Pages    │ Gratis │ ✅       │ ❌          │
│ Heroku          │ $7/mo  │ ✅       │ ✅          │
└─────────────────┴────────┴──────────┴─────────────┘
```

---

## ✅ OPCIÓN RECOMENDADA FINAL

**Para GRATIS TOTAL: Netlify + Render**

```
Frontend:  https://deglose.netlify.app
Backend:   https://deglose-api.onrender.com
```

**Paso 1: Frontend en Netlify**
1. https://netlify.com → Sign up
2. Import Git → deglose_cuentas
3. Env var: VITE_API_BASE_URL=https://deglose-api.onrender.com
4. Deploy (2 minutos)

**Paso 2: Backend en Render**
1. https://render.com → Sign up
2. New Web Service → deglose_cuentas repo
3. Root dir: backend/
4. Build: npm install
5. Start: node server.js
6. Deploy (3 minutos)

**Listo**: Completamente gratis ✅

---

## 🎬 ¿CUAL ELEGIO?

**Si quieres lo MEJOR ahora**: Vercel + Railway ($5/mo)
- Setup más fácil
- Performance mejor
- Soporte mejor

**Si quieres GRATIS PURO**: Netlify + Render (0 USD/mo)
- Funciona perfecto
- Render duerme si inactivo (no importa para desarrollo)
- Igual de confiable
