import React from 'react';
import { Plus, Minus, Package } from 'lucide-react';

export function StationeryItem({ id, name, price, quantity, stock_quantity = 0, onQuantityChange }) {
  const isOutOfStock = stock_quantity === 0;
  const isLowStock = stock_quantity > 0 && stock_quantity <= 5;
  const maxQuantity = Math.min(stock_quantity, 99); // Reasonable max limit

  const getStockStatusColor = () => {
    if (isOutOfStock) return 'text-red-600 bg-red-50';
    if (isLowStock) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getStockStatusText = () => {
    if (isOutOfStock) return 'Out of Stock';
    if (isLowStock) return `Only ${stock_quantity} left`;
    return `${stock_quantity} in stock`;
  };

  return (
    <div className={`flex items-center justify-between p-4 border rounded-lg shadow-sm transition-opacity ${
      isOutOfStock ? 'bg-gray-50 opacity-60' : 'bg-white'
    }`}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`font-semibold text-lg ${isOutOfStock ? 'text-gray-500' : 'text-gray-900'}`}>
            {name}
          </h3>
          {isOutOfStock && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
              Unavailable
            </span>
          )}
        </div>
        <p className={`text-lg font-medium mb-2 ${isOutOfStock ? 'text-gray-400' : 'text-gray-900'}`}>
          ₹{price.toFixed(2)}
        </p>

        {/* Stock Status */}
        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full w-fit ${getStockStatusColor()}`}>
          <Package className="w-3 h-3" />
          <span className="font-medium">{getStockStatusText()}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onQuantityChange(id, Math.max(0, quantity - 1))}
          disabled={isOutOfStock || quantity === 0}
          className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="w-5 h-5" />
        </button>
        <span className="w-8 text-center font-medium">{quantity}</span>
        <button
          onClick={() => onQuantityChange(id, quantity + 1)}
          disabled={isOutOfStock || quantity >= maxQuantity}
          className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={quantity >= maxQuantity ? `Maximum ${maxQuantity} items available` : ''}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
