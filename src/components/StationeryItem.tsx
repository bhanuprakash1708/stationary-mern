import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface StationeryItemProps {
  id: number;
  name: string;
  price: number;
  quantity: number;
  onQuantityChange: (id: number, newQuantity: number) => void;
}

export function StationeryItem({ id, name, price, quantity, onQuantityChange }: StationeryItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
      <div>
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-gray-600">₹{price.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onQuantityChange(id, Math.max(0, quantity - 1))}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <Minus className="w-5 h-5" />
        </button>
        <span className="w-8 text-center">{quantity}</span>
        <button
          onClick={() => onQuantityChange(id, quantity + 1)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}