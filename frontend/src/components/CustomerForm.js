// src/components/CustomerForm.js
import React, { useState, useEffect } from 'react';
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

  // 🚚 Despacho solo si el total >= 100.000 CLP
  const isDeliveryAvailable = totalAmount >= 100000;

  // ✅ Validaciones
  const validateName = (n) =>
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(n.trim()) && n.trim().length >= 2;

  const validateEmail = (e) =>
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(e.trim());

  const validatePhone = (p) => /^\+569[0-9]{8}$/.test(p.trim());

  // 🔍 Verificar cliente frecuente con debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (validateEmail(email) && validateName(name)) {
        checkFrequentUser(email, name);
      }
    }, 600);
    return () => clearTimeout(handler);
  }, [email, name]);

  const checkFrequentUser = async (email, userName) => {
    setIsCheckingFrequent(true);
    try {
      const response = await apiFetch(
        `/api/users/check-frequent/${encodeURIComponent(email)}?name=${encodeURIComponent(
          userName.trim()
        )}`
      );
      setIsFrequentUser(response.isFrequent);
      setFrequentUserInfo(response);

      if (response.isFrequent) {
        addToast(
          `🎉 ¡Hola ${response.name || response.user?.name}! Eres cliente frecuente con ${response.purchases} compras.`,
          'success'
        );
      }
    } catch (error) {
      console.warn('Error checking frequent user:', error);
    } finally {
      setIsCheckingFrequent(false);
    }
  };

  // 🎉 Descuento automático
  const discountPercentage = isFrequentUser ? 5 : 0;
  const discountAmount = (totalAmount * discountPercentage) / 100;
  const finalAmount = totalAmount - discountAmount;

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateName(name)) return addToast('Nombre inválido.', 'error');
    if (!validateEmail(email)) return addToast('Correo inválido.', 'error');
    if (!validatePhone(phone)) return addToast('Teléfono inválido.', 'error');
    if (isDelivery && !deliveryAddress.trim())
      return addToast('Debes ingresar dirección.', 'error');

    const customerData = {
      name,
      email,
      phone,
      pickupTime: isDelivery ? null : pickupTime,
      note,
      isDelivery,
      deliveryAddress: isDelivery ? deliveryAddress : null,
    };

    try {
      await apiFetch('/api/users/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });

      // Guardar en localStorage (puedes cifrarlo si quieres mayor seguridad)
      localStorage.setItem('customerData', JSON.stringify(customerData));
    } catch (error) {
      console.warn('Error registrando compra:', error);
    }

    onSubmit(customerData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Datos del Cliente y Recogida</h2>

      {/* Nombre */}
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-1">Nombre Completo:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ej. Juan Pérez González"
          required
        />
      </div>

      {/* Correo */}
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-1">Correo Electrónico:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ej. usuario@gmail.com"
          required
        />
        {isCheckingFrequent && (
          <p className="text-blue-500 text-xs mt-1">🔍 Verificando si eres cliente frecuente...</p>
        )}
      </div>

      {/* Teléfono */}
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-1">Teléfono:</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ej. +56912345678"
          required
        />
        <p className="text-gray-500 text-xs mt-1">*Formato: +569 seguido de 8 dígitos</p>
      </div>

      {/* Delivery */}
      {isDeliveryAvailable && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              id="delivery"
              checked={isDelivery}
              onChange={(e) => setIsDelivery(e.target.checked)}
              className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="delivery" className="text-green-700 font-bold">
              🚚 Despacho a Domicilio Disponible
            </label>
          </div>

          {isDelivery && (
            <div>
              <label className="block text-green-700 font-bold mb-1">Dirección de Despacho:</label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ej. Av. Siempre Viva 742, Springfield"
                required={isDelivery}
              />
              <p className="text-green-600 text-sm mt-1">
                *El despacho se realizará en horario de 14:00 a 18:00 hrs
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hora de retiro */}
      {!isDelivery && (
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-1">Hora de Recogida:</label>
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

      {/* Nota */}
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-1">Notas Adicionales:</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ej. Por favor, no olvides traer tu cédula de identidad."
        />
      </div>

      {/* Info frecuente */}
      {isFrequentUser && totalAmount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h3 className="text-green-800 font-bold mb-2">🎉 ¡Cliente Frecuente!</h3>
          <p className="text-green-700 text-sm">
            Tendrás un <strong>5% de descuento</strong> aplicado automáticamente al pagar.
          </p>
        </div>
      )}

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
