import User from '../models/User.js';
import LoginLog from '../models/LoginLog.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

function hashValue(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

// =========================
// Registrar usuario
// =========================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const user = new User({ name, email, password, role });
    const savedUser = await user.save();

    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message,
    });
  }
};

// =========================
// Login usuario
// =========================
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const emailHash = hashValue(email);
    const user = await User.findOne({ emailHash });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    const log = new LoginLog({ userId: user._id, email: user.email });
    await log.save();

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el login', error: error.message });
  }
};

// =========================
// Registrar compra
// =========================
export const registerPurchase = async (req, res) => {
  try {
    const { email, name, phone } = req.body;
    const emailHash = hashValue(email);
    const nameHash = hashValue(name);

    let user = await User.findOne({ emailHash, nameHash, role: 'cliente' });

    if (!user) {
      user = new User({
        name,
        email,
        phone: phone || '',
        role: 'cliente',
        purchases: 1,
        isFrequent: false,
      });
    } else {
      user.purchases += 1;
    }

    if (user.purchases >= 2) user.isFrequent = true;

    await user.save();

    res.json({
      message: user.isFrequent
        ? `¡Felicitaciones! Ahora eres cliente frecuente con ${user.purchases} compras`
        : `Compra registrada. Llevas ${user.purchases} compra(s)`,
      user: {
        name: user.name,
        email: user.email,
        purchases: user.purchases,
        isFrequent: user.isFrequent,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar compra', error: error.message });
  }
};

// =========================
// Verificar usuario frecuente
// =========================
export const checkFrequentUser = async (req, res) => {
  try {
    const { email } = req.params;
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nombre es requerido',
        isFrequent: false,
        purchases: 0,
      });
    }

    const emailHash = hashValue(email);
    const nameHash = hashValue(name);

    const user = await User.findOne({ emailHash, nameHash, role: 'cliente' });

    if (!user) {
      return res.json({ success: true, isFrequent: false, purchases: 0 });
    }

    res.json({
      success: true,
      isFrequent: user.isFrequent,
      purchases: user.purchases,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar usuario frecuente',
      error: error.message,
    });
  }
};
