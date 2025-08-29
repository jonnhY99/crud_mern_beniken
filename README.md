# 🥩 CRUD MERN Beniken

Aplicación web para gestión de pedidos de carnicería, construida con el stack **MERN** (MongoDB, Express, React, Node.js).  
Soporta autenticación con JWT, gestión de productos, pedidos y panel de administración.

---

## 🚀 Tecnologías principales

- **MongoDB Atlas** → Base de datos en la nube  
- **Express.js** → API backend  
- **React.js** → Frontend  
- **Node.js** → Entorno de servidor  
- **JWT** → Autenticación segura  
- **Render** → Hosting backend  
- **Vercel / Render** → Hosting frontend  

---

## 📂 Estructura del proyecto

```
crud_mern_beniken/
│── backend/        # API REST (Node + Express + MongoDB)
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
│── frontend/       # Aplicación cliente (React)
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── .env.example
│
│── README.md
│── .gitignore
```

---

## ⚙️ Instalación en local

### 1. Clonar el repositorio
```bash
git clone https://github.com/jonnhY99/crud_mern_beniken.git
cd crud_mern_beniken
```

### 2. Instalar dependencias
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configurar variables de entorno

#### 📌 `backend/.env.example`
```env
MONGODB_URI=mongodb+srv://<USER>:<PASSWORD>@cluster0.xxx.mongodb.net/beniken_db
JWT_SECRET=super-secreto
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
PORT=5000
```

#### 📌 `frontend/.env.example`
```env
REACT_APP_API_URL=http://localhost:5000
```

👉 Copia estos archivos y renómbralos a `.env` en cada carpeta, luego ajusta credenciales y URLs.

### 4. Correr el proyecto en desarrollo
En dos terminales separadas:

```bash
# Terminal 1 → Backend
cd backend
npm run dev

# Terminal 2 → Frontend
cd frontend
npm start
```

### 5. Acceder
- Frontend: [http://localhost:3000](http://localhost:3000)  
- Backend API: [http://localhost:5000/api](http://localhost:5000/api)  

---

## 🌐 Despliegue en la nube

### Backend en Render
1. Subir la carpeta `backend/` a Render como Web Service.  
2. Configurar variables de entorno:
   - `MONGODB_URI` → conexión a MongoDB Atlas  
   - `JWT_SECRET`  
   - `CLIENT_URL` → URL del frontend (Vercel/Render)  
   - `PORT=10000` (Render lo asigna automáticamente)  

### Frontend en Vercel / Render
1. Subir la carpeta `frontend/` a Vercel (recomendado) o Render.  
2. Configurar variable:
   ```
   REACT_APP_API_URL=https://<tu-backend>.onrender.com
   ```

---

## 🗄️ Base de datos (MongoDB Atlas)

1. Crear cluster en [MongoDB Atlas](https://cloud.mongodb.com).  
2. Importar datos desde Compass o usando:
   ```bash
   mongodump --uri="mongodb://127.0.0.1:27017/beniken_db" --out=./backup
   mongorestore --uri="mongodb+srv://<USER>:<PASSWORD>@cluster0.mongodb.net/beniken_db" ./backup/beniken_db
   ```
3. Ver colecciones en Atlas: `products`, `orders`, `users`, `loginlogs`, etc.

---

## ✨ Features principales

- 🛒 Gestión de productos  
- 📦 Pedidos en línea  
- 👨‍💼 Panel administrador  
- 🔒 Autenticación con JWT  
- 📊 Logs de inicio de sesión  
- ⚡ API REST con Express  
- 🌍 MongoDB Atlas en la nube  

---

## 🤝 Contribuciones
1. Haz un fork del proyecto  
2. Crea una rama (`git checkout -b feature/nueva-funcion`)  
3. Haz commit de tus cambios (`git commit -m 'Agrego nueva función'`)  
4. Haz push a la rama (`git push origin feature/nueva-funcion`)  
5. Abre un Pull Request  

---

## 📜 Licencia
Proyecto implementado para la carniceria Beniken.

---


