// backend/config/encryption.js
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Cargar .env ANTES de usar process.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const keyHex = process.env.DATA_ENCRYPTION_KEY;
if (!keyHex || keyHex.length !== 64) {
  throw new Error("❌ DATA_ENCRYPTION_KEY no válido (debe tener 64 caracteres hexadecimales)");
}

const key = Buffer.from(keyHex, "hex");
const algorithm = "aes-256-gcm";
const ivLength = 16;

// Cifrado
export function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return { data: encrypted, iv: iv.toString("hex"), tag };
}

// Descifrado
export function decrypt(encrypted) {
  if (!encrypted || !encrypted.data) return null;
  try {
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(encrypted.iv, "hex"));
    decipher.setAuthTag(Buffer.from(encrypted.tag, "hex"));
    let decrypted = decipher.update(encrypted.data, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return null;
  }
}

// Hash para búsqueda
export function hashValue(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
