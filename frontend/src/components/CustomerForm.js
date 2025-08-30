// src/components/CustomerForm.js
import React, { useState } from 'react';
import { apiFetch } from '../utils/api';
import { useToast } from '../context/ToastContext';

const CustomerForm = ({ onSubmit, totalAmount = 0 }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [pickupTime, setPickupTime] = useState('10:00 AM');
  const [isDelivery, setIsDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isFrequentUser, setIsFrequentUser] = useState(false);
  const [frequentUserInfo, setFrequentUserInfo] = useState(null);
  const [isCheckingFrequent, setIsCheckingFrequent] = useState(false);
  const { addToast } = useToast();
  
  // Check if delivery is available (minimum 100,000 CLP)
  const isDeliveryAvailable = totalAmount >= 100000;

  // Validation functions
  const validateName = (name) => {
    // Allow any name with letters, spaces, accents, hyphens, apostrophes
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
    return name.trim().length >= 2 && nameRegex.test(name.trim());
  };

  const validateEmail = (email) => {
    // More flexible email validation allowing various domains and special characters
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  };

  const validatePhone = (phone) => {
    // Chilean phone format: +569 followed by 8 digits
    const phoneRegex = /^\+569[0-9]{8}$/;
    return phoneRegex.test(phone.trim());
  };

  // Check if user is frequent when email and name are available
  const checkFrequentUser = async (email, userName) => {
    if (!validateEmail(email) || !userName || userName.trim().length < 2) return;
    
    setIsCheckingFrequent(true);
    try {
      const response = await apiFetch(`/api/users/check-frequent/${encodeURIComponent(email)}?name=${encodeURIComponent(userName.trim())}`);
      setIsFrequentUser(response.isFrequent);
      setFrequentUserInfo(response);
      
      if (response.isFrequent) {
        addToast(`🎉 ¡Hola ${response.name}! Eres cliente frecuente con ${response.purchases} compras. Tendrás 5% de descuento al pagar.`, 'success');
      }
    } catch (error) {
      console.warn('Error checking frequent user:', error);
    } finally {
      setIsCheckingFrequent(false);
    }
  };

  // Calculate discount and final amount (5% for frequent users)
  const discountPercentage = isFrequentUser ? 5 : 0;
  const discountAmount = (totalAmount * discountPercentage) / 100;
  const finalAmount = totalAmount - discountAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate individual fields
    if (!validateName(name)) {
      addToast('Por favor, ingresa un nombre válido (mínimo 2 caracteres, solo letras).', 'error');
      return;
    }

    if (!validateEmail(email)) {
      addToast('Por favor, ingresa un correo electrónico válido.', 'error');
      return;
    }

    if (!validatePhone(phone)) {
      addToast('Por favor, ingresa un teléfono válido con formato +569XXXXXXXX', 'error');
      return;
    }

    if (isDelivery && !deliveryAddress.trim()) {
      addToast('Por favor, ingresa una dirección de despacho.', 'error');
      return;
    }

    if (!isDelivery && !pickupTime) {
      addToast('Por favor, selecciona una hora de recogida.', 'error');
      return;
    }

    // All validations passed - proceed with order
    const customerData = { 
      name, 
      phone, 
      email, 
      pickupTime: isDelivery ? null : pickupTime, 
      note,
      isDelivery,
      deliveryAddress: isDelivery ? deliveryAddress : null
    };

    try {
      // ✅ Registrar compra para sistema de usuarios frecuentes
      const response = await apiFetch('/api/users/purchase', {
        method: 'POST',
        body: JSON.stringify({ email, name, phone }),
      });

      // Mostrar mensaje de usuario frecuente si aplica
      if (response.user && response.user.isFrequent) {
        addToast(`🎉 ${response.message}`, 'success');
      }

      // 🔔 Emitir evento global para actualizar "Usuarios Frecuentes"
      window.dispatchEvent(new Event('userFrequentUpdated'));

      // Continuar con el flujo normal del pedido
      onSubmit(customerData);
    } catch (err) {
      // Si falla el registro de compra, continuar igual con el pedido
      console.warn('Error registrando compra para usuarios frecuentes:', err);
      onSubmit(customerData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Datos del Cliente y Recogida
      </h2>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-1">
          Nombre Completo:
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            // Check for frequent user when both name and email are available
            if (e.target.value.trim().length >= 2 && email && validateEmail(email)) {
              setTimeout(() => checkFrequentUser(email, e.target.value), 500);
            }
          }}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ej. Juan Pérez González"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-1">
          Correo Electrónico:
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            // Check for frequent user when both email and name are available
            if (e.target.value.includes('@') && e.target.value.includes('.') && name && name.trim().length >= 2) {
              setTimeout(() => checkFrequentUser(e.target.value, name), 500);
            }
          }}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ej. usuario@gmail.com, correo@empresa.cl"
          required
        />
        {isCheckingFrequent && (
          <p className="text-blue-500 text-xs mt-1">
            🔍 Verificando si eres cliente frecuente...
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-1">
          Teléfono:
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ej. +56912345678"
          required
        />
        <p className="text-gray-500 text-xs mt-1">
          *Formato: +569 seguido de 8 dígitos
        </p>
      </div>

      {/* Delivery Option - Only show if total >= 100,000 CLP */}
      {isDeliveryAvailable && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              id="delivery"
              checked={isDelivery}
              onChange={(e) => {
                setIsDelivery(e.target.checked);
                if (!e.target.checked) {
                  setDeliveryAddress('');
                }
              }}
              className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="delivery" className="text-green-700 font-bold">
              🚚 Despacho a Domicilio Disponible
            </label>
          </div>
          
          {isDelivery && (
            <div>
              <label className="block text-green-700 font-bold mb-1">
                Dirección de Despacho:
              </label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ej. Av. siempre viva 742, Springfield"
                required={isDelivery}
              />
              <p className="text-green-600 text-sm mt-1">
                *El despacho se realizará en horario de 14:00 a 18:00 hrs
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Pickup Time - Only show if not delivery */}
      {!isDelivery && (
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-1">
            Hora de Recogida:
          </label>
          <select
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required={!isDelivery}
          >
            {[
              '06:30 AM','07:00 AM','07:30 AM','08:00 AM','08:30 AM','09:00 AM','09:30 AM',
              '10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','01:00 PM',
              '01:30 PM','02:00 PM','02:30 PM'
            ].map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-1">
          Notas Adicionales:
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ej. Por favor, no olvides traer tu cédula de identidad."
        />
      </div>

      {!isDelivery && (
        <p className="text-gray-600 text-sm mb-4">
          *Recuerda que el pedido es para retiro en Mercado Matadero Franklin, local 382, Santiago.
        </p>
      )}
      
      {isDelivery && (
        <p className="text-green-600 text-sm mb-4">
          *Tu pedido será despachado a la dirección indicada entre las 14:00 y 18:00 hrs.
        </p>
      )}
      
      {/* Frequent User Info (without showing discount amount) */}
      {isFrequentUser && totalAmount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h3 className="text-green-800 font-bold mb-2">🎉 ¡Cliente Frecuente!</h3>
          <p className="text-green-700 text-sm">
            Tendrás un <strong>5% de descuento</strong> aplicado automáticamente al momento del pago final.
          </p>
        </div>
      )}

      {!isDeliveryAvailable && totalAmount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-yellow-700 text-sm">
            💡 <strong>¡Tip!</strong> Agrega ${(100000 - totalAmount).toLocaleString('es-CL')} más a tu compra para habilitar el despacho a domicilio.
          </p>
        </div>
      )}
      
      <p className="text-gray-600 text-sm mb-4">
        *Si tienes dudas, contáctanos al +56933997*** o por correo carnes@beniken.com
      </p>

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
      >
        {isDelivery ? 'Confirmar Pedido con Despacho' : 'Confirmar Pedido para Retiro'}
      </button>
    </form>
  );
};

export default CustomerForm;
