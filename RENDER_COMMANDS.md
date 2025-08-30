# Comandos para Render Deployment

## Backend Service

### Configuración en Render Dashboard

**Service Type:** Web Service  
**Environment:** Node  
**Root Directory:** `/` (raíz del proyecto)

**Build Command:**
```bash
cd backend && npm install --production
```

**Start Command:**
```bash
cd backend && npm start
```

**Environment Variables:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/beniken_db
JWT_SECRET=beniken-production-secret-2024
NODE_ENV=production
CLIENT_URL=https://beniken-frontend.onrender.com
PORT=10000
```

## Frontend Service

### Configuración en Render Dashboard

**Service Type:** Static Site  
**Root Directory:** `/` (raíz del proyecto)

**Build Command:**
```bash
cd frontend && npm install && npm run build
```

**Publish Directory:**
```
frontend/build
```

**Environment Variables:**
```
REACT_APP_API_URL=https://beniken-backend.onrender.com
REACT_APP_SOCKET_URL=https://beniken-backend.onrender.com
```

## Comandos Alternativos (si los anteriores fallan)

### Backend Alternativo
**Build Command:**
```bash
npm install --prefix backend --production
```

**Start Command:**
```bash
npm start --prefix backend
```

### Frontend Alternativo
**Build Command:**
```bash
npm install --prefix frontend && npm run build --prefix frontend
```

## Verificación de package.json

### Backend package.json debe tener:
```json
{
  "scripts": {
    "start": "node server.js"
  },
  "main": "server.js"
}
```

### Frontend package.json debe tener:
```json
{
  "scripts": {
    "build": "react-scripts build",
    "start": "react-scripts start"
  }
}
```

## Orden de Deployment

1. **Primero:** Deploy Backend Service
2. **Esperar:** URL del backend (ej: https://beniken-backend.onrender.com)
3. **Segundo:** Deploy Frontend Service con URL del backend
4. **Configurar:** Variables de entorno con URLs reales

## Troubleshooting

### Si Build falla:
- Verificar que `package.json` existe en `backend/` y `frontend/`
- Verificar que `server.js` existe en `backend/`
- Verificar que `src/` existe en `frontend/`

### Si Start falla:
- Verificar variables de entorno en Render
- Verificar que `MONGODB_URI` apunta a MongoDB Atlas
- Verificar que `PORT` está configurado correctamente
