import React, { useState, useEffect } from 'react';
import { Package, Plus, Minus, Save, Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

export function StockManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchItems();

    // Set up interval to refresh stock data every 30 seconds
    const interval = setInterval(fetchItems, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured) {
        // Demo data
        const demoItems = [
          { id: 1, name: 'Notebook', price: 25.99, stock_quantity: 50 },
          { id: 2, name: 'Pen Set', price: 15.50, stock_quantity: 30 },
          { id: 3, name: 'Highlighters', price: 12.00, stock_quantity: 3 },
          { id: 4, name: 'Sticky Notes', price: 8.75, stock_quantity: 100 },
          { id: 5, name: 'Stapler', price: 22.00, stock_quantity: 0 },
          { id: 6, name: 'Paper Clips', price: 5.25, stock_quantity: 200 },
          { id: 7, name: 'Ruler', price: 7.50, stock_quantity: 40 },
          { id: 8, name: 'Eraser', price: 3.00, stock_quantity: 75 }
        ];
        setItems(demoItems);
        return;
      }

      const { data, error } = await supabase
        .from('stationery_items')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      setItems(data || []);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (itemId, newStock) => {
    setUpdateLoading(prev => ({ ...prev, [itemId]: true }));
    setError(null);
    setSuccessMessage('');

    try {
      if (!isSupabaseConfigured) {
        // Demo mode - just update local state
        setItems(items.map(item =>
          item.id === itemId
            ? { ...item, stock_quantity: newStock }
            : item
        ));
        setSuccessMessage('Stock updated successfully (Demo Mode)');
        setTimeout(() => setSuccessMessage(''), 3000);
        return;
      }

      const { error } = await supabase
        .from('stationery_items')
        .update({ stock_quantity: newStock })
        .eq('id', itemId);

      if (error) {
        throw error;
      }

      // Update local state
      setItems(items.map(item =>
        item.id === itemId
          ? { ...item, stock_quantity: newStock }
          : item
      ));

      setSuccessMessage('Stock updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err) {
      console.error('Error updating stock:', err);
      setError('Failed to update stock. Please try again.');
    } finally {
      setUpdateLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleStockChange = (itemId, change) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const newStock = Math.max(0, item.stock_quantity + change);
    updateStock(itemId, newStock);
  };

  const handleDirectStockUpdate = (itemId, value) => {
    const newStock = Math.max(0, parseInt(value) || 0);
    updateStock(itemId, newStock);
  };

  const getStockStatusColor = (stock) => {
    if (stock === 0) return 'text-red-600 bg-red-50 border-red-200';
    if (stock <= 5) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStockStatusText = (stock) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 5) return 'Low Stock';
    return 'In Stock';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading stock information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Stock Management</h2>
        </div>
        <button
          onClick={fetchItems}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="grid gap-4">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStockStatusColor(item.stock_quantity)}`}>
                      {getStockStatusText(item.stock_quantity)}
                    </span>
                  </div>
                  <p className="text-gray-600">₹{item.price.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStockChange(item.id, -1)}
                      disabled={updateLoading[item.id] || item.stock_quantity === 0}
                      className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <input
                      type="number"
                      value={item.stock_quantity}
                      onChange={(e) => handleDirectStockUpdate(item.id, e.target.value)}
                      disabled={updateLoading[item.id]}
                      className="w-20 text-center border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />

                    <button
                      onClick={() => handleStockChange(item.id, 1)}
                      disabled={updateLoading[item.id]}
                      className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStockChange(item.id, 10)}
                      disabled={updateLoading[item.id]}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50"
                    >
                      +10
                    </button>
                    <button
                      onClick={() => handleStockChange(item.id, 50)}
                      disabled={updateLoading[item.id]}
                      className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 disabled:opacity-50"
                    >
                      +50
                    </button>
                  </div>

                  {updateLoading[item.id] && (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Stock Status Guide:</h3>
          <div className="space-y-1 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
              <span>In Stock: More than 5 items available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
              <span>Low Stock: 1-5 items remaining</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
              <span>Out of Stock: 0 items available</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-900 mb-2">Auto-Update Info:</h3>
          <div className="space-y-1 text-sm text-yellow-800">
            <p>• Stock automatically reduces when customers place orders</p>
            <p>• Data refreshes every 30 seconds</p>
            <p>• Use the refresh button for immediate updates</p>
            <p>• Changes are reflected on customer page instantly</p>
          </div>
        </div>
      </div>
    </div>
  );
}
