// backend/server.js
import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';

import ordersRouterFactory from './routes/orders.js';
import productsRouterFactory from './routes/products.js';
import authRouter from './routes/auth.js';
import logsRouter from './routes/logs.js';
import { verifyToken, requireRole } from './middleware/auth.js';

const app = express();
const server = http.createServer(app);

// Si usas proxy / Render / Nginx, permite leer IP real del cliente
app.set('trust proxy', true);

// ===== CORS =====
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map(s => s.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// ===== Healthcheck =====
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ===== Socket.IO =====
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  },
});

// ===== Rutas públicas =====
app.use('/api/auth', authRouter);

// ===== Rutas de negocio (factories que reciben io) =====
app.use('/api/products', productsRouterFactory(io));
app.use('/api/orders', ordersRouterFactory(io));

// Logs de sesión (solo ADMIN). Si quieres permitir carnicería también,
// cambia requireRole('admin') por requireRole('admin','carniceria')
app.use('/api/logs', verifyToken, requireRole('admin'), logsRouter);

// ===== Conexión a Mongo + arranque =====
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;

if (!MONGODB_URI) {
  console.error('❌ Falta MONGODB_URI en backend/.env');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000, autoIndex: true })
  .then(() => {
    console.log('✅ MongoDB conectado');

    io.on('connection', (socket) => {
      console.log('Socket conectado:', socket.id);
      socket.on('disconnect', () => console.log('Socket desconectado:', socket.id));
    });

    server.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`🔗 CORS permitido: ${allowedOrigins.join(', ')}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error conectando a MongoDB:', err?.message || err);
    process.exit(1);
  });

// (Opcional) Manejo de errores no controlados para evitar cierres silenciosos
process.on('unhandledRejection', (reason) => {
  console.error('🔴 Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('🔴 Uncaught Exception:', err);
});
