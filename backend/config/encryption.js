// backend/config/encryption.js
import crypto from 'crypto';

// Configuración de cifrado
const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.ENCRYPTION_SECRET || 'beniken-secret-key-2024-very-secure-32b';
const IV_LENGTH = 16; // Para AES, esto es siempre 16

// Generar clave de 32 bytes desde el secret
const getKey = () => {
  return crypto.scryptSync(SECRET_KEY, 'salt', 32);
};

/**
 * Cifrar texto
 * @param {string} text - Texto a cifrar
 * @returns {object} - Objeto con iv, data y tag
 */
export const encrypt = (text) => {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error('El texto a cifrar debe ser una cadena válida');
    }

    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipherGCM(ALGORITHM, key, iv);
    cipher.setAAD(Buffer.from('beniken-aad', 'utf8'));

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();

    return {
      iv: iv.toString('hex'),
      data: encrypted,
      tag: tag.toString('hex')
    };
  } catch (error) {
    console.error('Error en encrypt:', error);
    throw new Error('Error al cifrar los datos');
  }
};

/**
 * Descifrar texto
 * @param {object} encryptedData - Objeto con iv, data y tag
 * @returns {string} - Texto descifrado
 */
export const decrypt = (encryptedData) => {
  try {
    if (!encryptedData || typeof encryptedData !== 'object') {
      return null;
    }

    const { iv, data, tag } = encryptedData;
    
    if (!iv || !data || !tag) {
      return null;
    }

    const key = getKey();
    const decipher = crypto.createDecipherGCM(ALGORITHM, key, Buffer.from(iv, 'hex'));
    decipher.setAAD(Buffer.from('beniken-aad', 'utf8'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Error en decrypt:', error);
    return null;
  }
};

/**
 * Crear hash de un valor para indexación
 * @param {string} value - Valor a hashear
 * @returns {string} - Hash SHA-256
 */
export const hashValue = (value) => {
  try {
    if (!value || typeof value !== 'string') {
      throw new Error('El valor a hashear debe ser una cadena válida');
    }

    return crypto
      .createHash('sha256')
      .update(value + SECRET_KEY)
      .digest('hex');
  } catch (error) {
    console.error('Error en hashValue:', error);
    throw new Error('Error al crear hash del valor');
  }
};

/**
 * Verificar si un texto coincide con un hash
 * @param {string} text - Texto original
 * @param {string} hash - Hash a verificar
 * @returns {boolean} - True si coinciden
 */
export const verifyHash = (text, hash) => {
  try {
    const computedHash = hashValue(text);
    return computedHash === hash;
  } catch (error) {
    console.error('Error en verifyHash:', error);
    return false;
  }
};

/**
 * Generar salt aleatorio
 * @param {number} length - Longitud del salt (default: 16)
 * @returns {string} - Salt en hexadecimal
 */
export const generateSalt = (length = 16) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Cifrar con salt personalizado
 * @param {string} text - Texto a cifrar
 * @param {string} salt - Salt personalizado
 * @returns {object} - Objeto con datos cifrados y salt
 */
export const encryptWithSalt = (text, salt = null) => {
  try {
    const usedSalt = salt || generateSalt();
    const saltedText = text + usedSalt;
    const encrypted = encrypt(saltedText);
    
    return {
      ...encrypted,
      salt: usedSalt
    };
  } catch (error) {
    console.error('Error en encryptWithSalt:', error);
    throw new Error('Error al cifrar con salt');
  }
};

/**
 * Descifrar con salt
 * @param {object} encryptedData - Datos cifrados con salt
 * @returns {string} - Texto original sin salt
 */
export const decryptWithSalt = (encryptedData) => {
  try {
    const { salt, ...encrypted } = encryptedData;
    const decrypted = decrypt(encrypted);
    
    if (!decrypted || !salt) {
      return null;
    }

    // Remover el salt del final
    return decrypted.slice(0, -salt.length);
  } catch (error) {
    console.error('Error en decryptWithSalt:', error);
    return null;
  }
};

export default {
  encrypt,
  decrypt,
  hashValue,
  verifyHash,
  generateSalt,
  encryptWithSalt,
  decryptWithSalt
};
