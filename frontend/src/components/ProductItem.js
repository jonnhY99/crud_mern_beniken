import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Plus, Minus } from 'lucide-react';

const formatCLP = (value) => {
  // 6298 => "$6.298"
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
};

const ProductItem = ({ product, onAddToCart, onEditProduct }) => {
  const { user } = useContext(AuthContext);
  const [quantity, setQuantity] = useState(0.5); // Default 0.5 kg
  
  // Calculate estimated price
  const estimatedPrice = quantity * product.price;
  
  const handleQuantityChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setQuantity(Math.max(0, value)); // Ensure non-negative
  };

  const incrementQuantity = () => {
    setQuantity(prev => Math.round((prev + 0.1) * 10) / 10); // Round to 1 decimal
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(0.1, Math.round((prev - 0.1) * 10) / 10)); // Min 0.1, round to 1 decimal
  };

  const handleAdd = () => {
    if (quantity > 0) {
      // Pass product with quantity and estimated price
      onAddToCart(product, quantity, estimatedPrice);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-40 sm:h-48 object-cover rounded-md mb-3 sm:mb-4"
        loading="lazy"
        onError={(e) => { 
          e.currentTarget.src = '/image/placeholder.svg';
          e.currentTarget.onerror = null; // Prevent infinite loop
        }}
      />

      <h3 className="text-lg sm:text-xl font-semibold mb-1">{product.name}</h3>
      <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2">{product.description}</p>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-1 sm:gap-0">
        <span className="text-red-600 font-bold text-lg sm:text-xl">
          {formatCLP(product.price)}/{product.unit}
        </span>
        <span className="text-gray-500 text-xs sm:text-sm">Stock: {Math.round(product.stock || 0)}</span>
      </div>

      {/* Quantity selector and estimated price - Mobile optimized */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-3">
        <div className="flex-1">
          <label className="text-xs text-gray-600 mb-1 block">Cantidad ({product.unit})</label>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            {/* Botón decrementar */}
            <button
              type="button"
              onClick={decrementQuantity}
              className="px-2 sm:px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors touch-manipulation"
            >
              <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            
            {/* Input de cantidad */}
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              step="0.1"
              min="0.1"
              className="w-12 sm:w-16 px-1 sm:px-2 py-2 text-center text-sm border-0 focus:outline-none focus:ring-0"
            />
            
            {/* Botón incrementar */}
            <button
              type="button"
              onClick={incrementQuantity}
              className="px-2 sm:px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors touch-manipulation"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Estimated price display */}
        <div className="flex-1 sm:flex-initial">
          <label className="text-xs text-gray-600 mb-1 block">Precio estimado</label>
          <span className="text-base sm:text-lg font-bold text-green-600 block">
            {formatCLP(estimatedPrice)}
          </span>
        </div>
      </div>

      {/* Add to cart button */}
      <button
        onClick={handleAdd}
        disabled={quantity <= 0 || (product.stock && quantity > product.stock)}
        className="w-full mt-3 sm:mt-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 sm:py-3 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base touch-manipulation"
      >
        {quantity <= 0 ? 'Selecciona cantidad' : 
         (product.stock && quantity > product.stock) ? 'Stock insuficiente' : 
         'Agregar al carrito'}
      </button>

      {/* Admin Edit Button */}
      {user && user.role === 'admin' && onEditProduct && (
        <div className="mt-3">
          <button
            onClick={() => onEditProduct(product)}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Editar Producto
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductItem;
