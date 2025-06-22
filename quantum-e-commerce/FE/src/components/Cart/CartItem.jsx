import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/24/outline';
import { formatPrice } from '../../utils/helpers';

const CartItem = ({ item, onUpdateQuantity, onRemove, onToggleSelect }) => {
  const { id, product, quantity, selected } = item;
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1 || newQuantity > product.stock) return;
    
    setLoading(true);
    try {
      await onUpdateQuantity(id, newQuantity);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await onRemove(id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center p-4 border-b border-gray-200">
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggleSelect(id)}
        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mr-4"
      />

      {/* Product Image */}
      <Link to={`/product/${product.id}`} className="flex-shrink-0">
        <img
          src={product.images?.[0] || '/images/placeholder-product.jpg'}
          alt={product.name}
          className="h-20 w-20 object-cover rounded"
        />
      </Link>

      {/* Product Info */}
      <div className="flex-1 ml-4">
        <Link 
          to={`/product/${product.id}`}
          className="text-gray-800 hover:text-primary font-medium line-clamp-2"
        >
          {product.name}
        </Link>
        
        <div className="text-sm text-gray-500 mt-1">
          Shop: {product.seller_name}
        </div>

        {/* Variants */}
        {product.variants && (
          <div className="text-sm text-gray-500 mt-1">
            Phân loại: {product.selected_variant}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="text-primary font-semibold text-lg mx-8">
        {formatPrice(product.price)}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center mx-8">
        <button
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={loading || quantity <= 1}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l hover:bg-gray-50 disabled:opacity-50"
        >
          -
        </button>
        <input
          type="number"
          min="1"
          max={product.stock}
          value={quantity}
          onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
          className="w-16 h-8 text-center border-t border-b border-gray-300 focus:outline-none"
          disabled={loading}
        />
        <button
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={loading || quantity >= product.stock}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r hover:bg-gray-50 disabled:opacity-50"
        >
          +
        </button>
      </div>

      {/* Total Price */}
      <div className="text-primary font-bold text-lg mx-8">
        {formatPrice(product.price * quantity)}
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        disabled={loading}
        className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default CartItem;