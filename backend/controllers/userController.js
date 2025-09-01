// controllers/userController.js
import User from '../models/User.js';
import LoginLog from '../models/LoginLog.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { encrypt } from '../utils/encryption.js'; // Asegúrate que este path sea correcto

// 🔑 Función para hashear valores sensibles
function hashValue(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

// =========================
// Registrar usuario
// =========================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, isFrequent } = req.body;

    const encryptedName = encrypt(name);
    const encryptedEmail = encrypt(email);

    const user = new User({ 
      name: encryptedName,
      nameHash: hashValue(encryptedName.data),
      email: encryptedEmail,
      emailHash: hashValue(encryptedEmail.data),
      password,
      role: role || 'cliente',
      isFrequent: isFrequent || false
    });

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
        name: name,
        email: email,
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

    // Guardar log
    const log = new LoginLog({ userId: user._id, email: email });
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
// Actualizar usuario (solo admin)
// =========================
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, password, isFrequent } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (name) {
      const encryptedName = encrypt(name);
      user.name = encryptedName;
      user.nameHash = hashValue(encryptedName.data);
    }

    if (email) {
      const encryptedEmail = encrypt(email);
      user.email = encryptedEmail;
      user.emailHash = hashValue(encryptedEmail.data);
    }

    if (role) user.role = role;
    if (typeof isFrequent !== 'undefined') user.isFrequent = isFrequent;
    if (password && password.trim() !== '') user.password = password; // se cifra en pre('save')

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
  }
};

// El resto del archivo (getUsers, getLoginLogs, deleteUser, etc.) no requiere cambios relacionados con el cifrado, por lo que puedes dejarlo tal como ya lo tenías.


// =========================
// Eliminar usuario (solo admin)
// =========================
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    await user.deleteOne();
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
};

// =========================
// Obtener usuarios frecuentes
// =========================
export const getFrequentUsers = async (req, res) => {
  try {
    const users = await User.find({ isFrequent: true, role: 'cliente' }).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener usuarios frecuentes', error: error.message });
  }
};
