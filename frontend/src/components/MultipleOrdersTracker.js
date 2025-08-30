// src/components/MultipleOrdersTracker.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Package, Clock, CheckCircle } from 'lucide-react';

const formatCLP = (value) => {
  return `$${Math.round(value).toLocaleString('es-CL')}`;
};

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'Listo':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'Entregado':
      return <CheckCircle className="w-4 h-4 text-gray-600" />;
    default:
      return <Clock className="w-4 h-4 text-yellow-600" />;
  }
};

const MultipleOrdersTracker = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Obtener pedidos activos del usuario
  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      
      // Obtener información del usuario desde localStorage o contexto
      const customerData = JSON.parse(localStorage.getItem('customerData') || '{}');
      if (!customerData.email && !customerData.name) {
        return; // No hay datos del usuario
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/orders/customer/${encodeURIComponent(customerData.email)}?name=${encodeURIComponent(customerData.name)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        // Filtrar solo pedidos activos (no entregados)
        const activeOrders = data.filter(order => order.status !== 'Entregado');
        setOrders(activeOrders);
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchUserOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOrderClick = (orderId) => {
    localStorage.setItem('trackingOrderId', orderId);
    navigate('/order-status');
  };

  // No mostrar si no hay pedidos activos
  if (orders.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-b border-blue-200">
      <div className="container mx-auto px-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-3 flex items-center justify-between text-blue-800 hover:text-blue-900 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            <span className="font-medium">
              Tienes {orders.length} pedido{orders.length !== 1 ? 's' : ''} activo{orders.length !== 1 ? 's' : ''}
            </span>
          </div>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {isExpanded && (
          <div className="pb-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => handleOrderClick(order.id)}
                  className="bg-white rounded-lg p-4 border border-blue-200 hover:border-blue-400 cursor-pointer transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800">#{order.id}</span>
                    <div className="flex items-center gap-1">
                      <StatusIcon status={order.status} />
                      <span className="text-sm text-gray-600">{order.status}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      <strong>Total:</strong> {formatCLP(order.totalCLP || 0)}
                    </div>
                    <div>
                      <strong>Retiro:</strong> {order.pickupTime || 'Por confirmar'}
                    </div>
                    {order.paid && (
                      <div className="text-green-600 font-medium">
                        ✅ Pagado
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 text-xs text-blue-600 hover:text-blue-800">
                    Click para ver detalles →
                  </div>
                </div>
              ))}
            </div>
            
            {loading && (
              <div className="text-center py-2 text-blue-600">
                Actualizando pedidos...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultipleOrdersTracker;
