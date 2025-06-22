import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { Plus, Trash, LogOut, Clock, Package, Calendar as CalendarIcon, Loader2, AlertCircle, Info, ShoppingBag, Archive } from 'lucide-react';
import { format } from 'date-fns';
import { TimeSlotGrid } from '../components/TimeSlotGrid.jsx';
import { OrdersManagement } from '../components/OrdersManagement.jsx';
import { StockManagement } from '../components/StockManagement.jsx';

export function AdminDashboard() {
  const { logout } = useAuth();
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', price: '' });
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rushStatusMap, setRushStatusMap] = useState({});
  const [rushLoading, setRushLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setPageLoading(true);
      setError(null);
      try {
        await Promise.all([fetchItems(), fetchRushStatuses()]);
      } catch (err) {
        setError('Failed to load dashboard data. Please refresh the page.');
        console.error('Error loading dashboard data:', err);
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchItems = async () => {
    try {
      if (!isSupabaseConfigured) {
        // Demo data for admin dashboard
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

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  };

  const fetchRushStatuses = async () => {
    try {
      if (!isSupabaseConfigured) {
        // Demo data for rush statuses
        const demoStatuses = {
          [`${format(selectedDate, 'yyyy-MM-dd')}_9:00 AM`]: 'high',
          [`${format(selectedDate, 'yyyy-MM-dd')}_10:00 AM`]: 'medium',
          [`${format(selectedDate, 'yyyy-MM-dd')}_2:00 PM`]: 'low'
        };
        setRushStatusMap(demoStatuses);
        return;
      }

      const { data, error } = await supabase
        .from('rush_status')
        .select('*')
        .eq('date', format(selectedDate, 'yyyy-MM-dd'));

      if (error) throw error;

      // Convert to date_timeSlot -> status mapping for TimeSlotGrid
      const statusMap = {};
      data?.forEach(status => {
        const key = `${status.date}_${status.time_slot}`;
        statusMap[key] = status.status;
      });
      setRushStatusMap(statusMap);
    } catch (error) {
      console.error('Error fetching rush statuses:', error);
      throw error;
    }
  };

  const addItem = async () => {
    if (!newItem.name || !newItem.price) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('stationery_items')
        .insert({
          name: newItem.name,
          price: parseFloat(newItem.price)
        });

      if (error) throw error;

      setNewItem({ name: '', price: '' });
      await fetchItems();
      alert('Item added successfully!');
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('stationery_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchItems();
      alert('Item deleted successfully!');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  const handleRushStatusChange = async (date, timeSlot, status) => {
    setRushLoading(true);
    try {
      if (!isSupabaseConfigured) {
        // Demo mode - just update local state
        const key = `${date}_${timeSlot}`;
        setRushStatusMap(prev => ({
          ...prev,
          [key]: status
        }));
        return;
      }

      const { error } = await supabase
        .from('rush_status')
        .upsert({
          date: date,
          time_slot: timeSlot,
          status: status
        });

      if (error) throw error;

      // Update local state immediately for better UX
      const key = `${date}_${timeSlot}`;
      setRushStatusMap(prev => ({
        ...prev,
        [key]: status
      }));

    } catch (error) {
      console.error('Error updating rush status:', error);
      alert('Failed to update rush status. Please try again.');
    } finally {
      setRushLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
          <p className="text-gray-600 max-w-md">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {!isSupabaseConfigured && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
          <div className="max-w-7xl mx-auto flex">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-orange-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-700">
                  <strong>Demo Mode:</strong> Admin functions are limited. Configure Supabase in <code className="bg-orange-100 px-1 rounded">.env.local</code> to enable full admin functionality.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Orders
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
              activeTab === 'items'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Package className="w-4 h-4" />
            Manage Items
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
              activeTab === 'stock'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Archive className="w-4 h-4" />
            Stock Management
          </button>
          <button
            onClick={() => setActiveTab('rush')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
              activeTab === 'rush'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            Rush Hours
          </button>
        </div>

        {activeTab === 'orders' && (
          <OrdersManagement />
        )}

        {activeTab === 'stock' && (
          <StockManagement />
        )}

        {activeTab === 'items' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Stationery Items</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <input
                type="text"
                placeholder="Item name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Price"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addItem}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-600 ml-2">₹{item.price}</span>
                  </div>
                  <button
                    onClick={() => deleteItem(item.id)}
                    disabled={loading}
                    className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rush' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Rush Hour Management</h2>
            <p className="text-gray-600 mb-6">
              Manage rush hour status for different time slots. Customers will see these colors when booking.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {rushLoading && (
              <div className="mb-4 flex items-center gap-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Updating rush status...</span>
              </div>
            )}

            <TimeSlotGrid
              selectedDate={selectedDate}
              rushStatuses={rushStatusMap}
              onRushStatusChange={handleRushStatusChange}
            />
          </div>
        )}
      </main>
    </div>
  );
}
