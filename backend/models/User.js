// backend/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.DATA_ENCRYPTION_KEY, 'hex'); // debe ser 32 bytes (64 hex)
const ivLength = 16;

// Función de cifrado
function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return { data: encrypted, iv: iv.toString('hex'), tag };
}

// Función de descifrado
function decrypt(encrypted) {
  if (!encrypted || !encrypted.data) return null;
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(encrypted.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(encrypted.tag, 'hex'));
  let decrypted = decipher.update(encrypted.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Función para hashear valores (determinístico, sirve para búsqueda)
function hashValue(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

const userSchema = new mongoose.Schema(
  {
    name: { type: Object, required: true, get: decrypt },
    email: { type: Object, required: true, unique: true, get: decrypt },
    emailHash: { type: String, required: true, index: true },
    nameHash: { type: String, required: true, index: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'carniceria', 'cliente'],
      default: 'cliente',
      required: true,
    },
    purchases: { type: Number, default: 0 },
    isFrequent: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } }
);

// Pre-save → cifrar y hashear
userSchema.pre('save', function (next) {
  if (this.isModified('name') && typeof this.name === 'string') {
    this.name = encrypt(this.name);
    this.nameHash = hashValue(decrypt(this.name));
  }
  if (this.isModified('email') && typeof this.email === 'string') {
    this.email = encrypt(this.email);
    this.emailHash = hashValue(decrypt(this.email));
  }
  next();
});

// Contraseña hash
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Método para validar contraseña
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
