import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 📌 Cargar variables de entorno desde ../.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import mongoose from "mongoose";
import User from "../models/User.js";
import { encrypt, decrypt, hashValue } from "../config/encryption.js";

// 👤 Usuarios iniciales (en texto plano)
const users = [
  {
    name: "Administrador",
    email: "admin@beniken.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Carnicería Local",
    email: "carniceria@beniken.com",
    password: "carne123",
    role: "carniceria",
  },
  {
    name: "Cliente Axel",
    email: "axel@beniken.com",
    password: "axel123",
    role: "cliente",
  },
];

// 🔓 Función para desencriptar campos tipo Object

function decryptMapField(mapField) {
  if (!mapField || typeof mapField !== "object") return undefined;
  const { iv, data, tag } = mapField;
  if (!iv || !data || !tag) return undefined;
  return decrypt({ iv, data, tag });
}

(async () => {
  try {
    console.log("🔑 DATA_ENCRYPTION_KEY longitud:", process.env.DATA_ENCRYPTION_KEY?.length);

    // 🔌 Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log("✅ Conectado a MongoDB");

    // 🗑 Limpiar usuarios previos
    await User.deleteMany();
    console.log("🗑 Usuarios anteriores eliminados");

    // ➕ Insertar usuarios cifrados
    const createdUsers = [];
    for (const data of users) {
      const encryptedName = encrypt(data.name);
      const encryptedEmail = encrypt(data.email);

      const user = new User({
        name: encryptedName,
        email: encryptedEmail,
        nameHash: hashValue(encryptedName.data),
        emailHash: hashValue(encryptedEmail.data),
        password: data.password,
        role: data.role,
      });

      const savedUser = await user.save();

      createdUsers.push({
        id: savedUser._id.toString(),
        name: savedUser.name,   // ✅ se aplicará el getter automático
        email: savedUser.email, // ✅ se aplicará el getter automático
        role: savedUser.role,
        passwordHashed: savedUser.password.startsWith("$2b$"),
      });
      
    }

    console.log("✅ Usuarios creados:");
    console.table(createdUsers);
  } catch (err) {
    console.error("❌ Error al poblar usuarios:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Desconectado de MongoDB");
  }
})();
