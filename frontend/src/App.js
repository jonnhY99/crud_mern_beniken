// src/App.js
import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import LayoutHeader from './components/HeaderLayout.js';
import ProductList from './components/ProductList.js';
import CartItem from './components/CartItem.js';
import OrderSummary from './components/OrderSummary.js';
import CustomerForm from './components/CustomerForm.js';
import LoginForm from './components/LoginForm.js';
import AdminOrderCard from './components/AdminOrderItem.js';
import AdminLoginLogs from './components/AdminLoginLogs.js';
import AdminReports from './components/AdminReports';
import ButcherOrdersBoard from './components/ButcherOrdersBoard';
import OrderStatusPage from './components/OrderStatusPage.js';
import PaymentPage from './components/PaymentPage.js';

import { createStorage, setStorage } from './utils/storage.js';
import { initSocket, getSocket, disconnectSocket } from './utils/socket';

import {
  fetchOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} from './api/orders';
import { fetchProducts } from './api/products';

const App = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => createStorage('cart', []));
  const [allOrders, setAllOrders] = useState([]);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [trackingOrderId, setTrackingOrderId] = useState(
    () => localStorage.getItem('trackingOrderId') || ''
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (trackingOrderId) {
      localStorage.setItem('trackingOrderId', trackingOrderId);
    } else {
      localStorage.removeItem('trackingOrderId');
    }
  }, [trackingOrderId]);

  useEffect(() => setStorage('cart', cart), [cart]);

  useEffect(() => {
    fetchProducts().then(setProducts).catch((e) => console.error('fetchProducts error:', e));
    fetchOrders().then(setAllOrders).catch((e) => console.error('fetchOrders error:', e));
  }, []);

  useEffect(() => {
    const userId = user?.id || null;
    const s = initSocket(userId);

    const onOrderCreated = (order) =>
      setAllOrders((prev) => (prev.some((o) => o.id === order.id) ? prev : [order, ...prev]));
    const onOrderUpdated = (order) =>
      setAllOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
    const onOrderDeleted = ({ id }) =>
      setAllOrders((prev) => prev.filter((o) => o.id !== id));

    const onProductsUpdated = (updatedList) => {
      setProducts((prev) => {
        const map = new Map(prev.map((p) => [p.id, p]));
        updatedList.forEach((u) => {
          const prevP = map.get(u.id) || {};
          map.set(u.id, { ...prevP, ...u });
        });
        return Array.from(map.values()).sort((a, b) => (a.id > b.id ? 1 : -1));
      });
    };

    s?.on('orders:created', onOrderCreated);
    s?.on('orders:updated', onOrderUpdated);
    s?.on('orders:deleted', onOrderDeleted);
    s?.on('products:updated', onProductsUpdated);

    return () => {
      const sock = getSocket();
      sock?.off('orders:created', onOrderCreated);
      sock?.off('orders:updated', onOrderUpdated);
      sock?.off('orders:deleted', onOrderDeleted);
      sock?.off('products:updated', onProductsUpdated);
    };
  }, [user?.id]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setTrackingOrderId('');
    disconnectSocket();
    navigate('/');
  };

  const handleAddToCart = (product, quantity) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.productId === product.id);
      const newQty = (existing?.quantity || 0) + quantity;

      if (newQty > product.stock) {
        alert(`Solo quedan ${product.stock} unidades de ${product.name}.`);
        return prevCart;
      }

      if (existing) {
        return prevCart.map((i) =>
          i.productId === product.id ? { ...i, quantity: newQty } : i
        );
      }
      return [
        ...prevCart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          unit: product.unit || 'kg',
          image: product.image,
          quantity,
        },
      ];
    });
  };

  const handleUpdateCartQuantity = (productId, newQuantity) => {
    const p = products.find((x) => x.id === productId);
    if (p && newQuantity > p.stock) {
      alert(`Solo quedan ${p.stock} unidades de ${p.name}.`);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((i) => (i.productId === productId ? { ...i, quantity: newQuantity } : i))
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((i) => i.productId !== productId));
  };

  const handlePlaceOrder = async (customerInfo) => {
    if (!cart.length) {
      alert('El carrito está vacío. Agrega productos antes de confirmar el pedido.');
      return;
    }
    try {
      const totalCLP = cart.reduce((s, i) => s + i.price * i.quantity, 0);
      const payload = {
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email,
        pickupTime: customerInfo.pickupTime,
        note: customerInfo.note,
        status: 'Pendiente',
        totalCLP,
        items: cart.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          unit: i.unit || 'kg',
          price: i.price,
        })),
      };

      const created = await createOrder(payload);

      setTrackingOrderId(created.id);
      localStorage.setItem('trackingOrderId', created.id);
      localStorage.setItem('paymentTotal', totalCLP); // 💾 Guardar total para PaymentPage
      setCart([]);

      navigate('/payment');
    } catch (err) {
      console.error(err);
      alert('No se pudo crear el pedido (¿stock insuficiente?).');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error(err);
      alert('Error al actualizar el estado del pedido');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const ok = window.confirm(`¿Eliminar el pedido ${orderId}? Esta acción no se puede deshacer.`);
    if (!ok) return;
    try {
      await deleteOrder(orderId);
      if (orderId === trackingOrderId) {
        setTrackingOrderId('');
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el pedido');
    }
  };

  const calculateCartTotal = cart.reduce((acc, item) => {
    const precioNumerico = Number(item.price) || 0;
    return acc + precioNumerico * item.quantity;
  }, 0);

  const isAdmin = user?.role === 'admin';
  const isButcher = user?.role === 'carniceria';

  return (
    <div className="min-h-screen bg-gray-100">
      <LayoutHeader user={user} onLogout={handleLogout} trackingOrderId={trackingOrderId} />

      <main className="container mx-auto p-6">
        <Routes>
          <Route path="/" element={<ProductList products={products} onAddToCart={handleAddToCart} />} />
          <Route path="/login" element={<LoginForm onLoginSuccess={(u) => { setUser(u); navigate('/'); }} />} />
          <Route
            path="/cart"
            element={
              cart.length === 0 ? (
                <p className="text-center text-gray-600 text-xl">
                  Tu carrito está vacío. ¡Agrega algo de carnita!
                </p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                    {cart.map((item) => (
                      <CartItem
                        key={item.productId}
                        item={item}
                        onUpdateQuantity={handleUpdateCartQuantity}
                        onRemoveItem={handleRemoveFromCart}
                      />
                    ))}
                  </div>
                  <div className="lg:col-span-1">
                    <OrderSummary cartItems={cart} />
                    <div className="mt-6">
                      <CustomerForm onSubmit={handlePlaceOrder} />
                    </div>
                  </div>
                </div>
              )
            }
          />
          <Route
            path="/payment"
            element={
              <PaymentPage
                total={Number(localStorage.getItem('paymentTotal')) || calculateCartTotal}
                orderId={trackingOrderId || localStorage.getItem('trackingOrderId')}
                onPaymentComplete={() => navigate('/order-status')}
              />
            }
          />
          <Route path="/order-status" element={<OrderStatusPage orderId={trackingOrderId} onGoHome={() => navigate('/')} />} />
          <Route path="/carniceria" element={isButcher || isAdmin ? <ButcherOrdersBoard orders={allOrders} onUpdateStatus={handleUpdateOrderStatus} onDeleteOrder={handleDeleteOrder} isAdmin={isAdmin} /> : <p className="text-center text-red-600">No tienes permisos para ver esta sección.</p>} />
          <Route path="/admin" element={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{allOrders.map((order) => (<AdminOrderCard key={order.id} order={order} onUpdateStatus={handleUpdateOrderStatus} />))}</div>} />
          <Route path="/logs" element={isAdmin ? <AdminLoginLogs /> : <p className="text-center text-red-600">No tienes permisos para ver esta sección.</p>} />
          <Route path="/reportes" element={isAdmin ? <AdminReports /> : <p className="text-center text-red-600">No tienes permisos para ver esta sección.</p>} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
