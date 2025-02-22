import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Trash, LogOut, Clock, Package, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { TimeSlotGrid } from '../components/TimeSlotGrid';

interface StationeryItem {
  id: number;
  name: string;
  price: number;
}

interface RushStatus {
  id: number;
  date: string;
  time_slot: string;
  status: 'high' | 'medium' | 'low';
}

export function AdminDashboard() {
  const { logout } = useAuth();
  const [items, setItems] = useState<StationeryItem[]>([]);
  const [newItem, setNewItem] = useState({ name: '', price: '' });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [rushStatus, setRushStatus] = useState<'high' | 'medium' | 'low'>('low');
  const [activeTab, setActiveTab] = useState<'items' | 'rush'>('items');
  const [loading, setLoading] = useState(false);
  const [rushStatusMap, setRushStatusMap] = useState<Record<string, RushStatus>>({});

  useEffect(() => {
    fetchItems();
    fetchRushStatuses();
  }, [selectedDate]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('stationery_items')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      alert('Failed to fetch items');
    }
  };

  const fetchRushStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('rush_status')
        .select('*')
        .eq('date', format(selectedDate, 'yyyy-MM-dd'));

      if (error) throw error;

      const statusMap = (data || []).reduce((acc: Record<string, RushStatus>, status) => {
        acc[status.time_slot] = status;
        return acc;
      }, {});

      setRushStatusMap(statusMap);
    } catch (error) {
      console.error('Error fetching rush statuses:', error);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
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
      fetchItems();
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('stationery_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRushStatus = async () => {
    if (!selectedTimeSlot) {
      alert('Please select a time slot');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('rush_status')
        .upsert({
          date: format(selectedDate, 'yyyy-MM-dd'),
          time_slot: selectedTimeSlot,
          status: rushStatus
        });

      if (error) throw error;
      fetchRushStatuses();
    } catch (error) {
      console.error('Error updating rush status:', error);
      alert('Failed to update rush status');
    } finally {
      setLoading(false);
    }
  };

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

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setActiveTab('items')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              activeTab === 'items'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Package className="w-4 h-4" />
            Manage Items
          </button>
          <button
            onClick={() => setActiveTab('rush')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              activeTab === 'rush'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            Manage Rush Hours
          </button>
        </div>

        {activeTab === 'items' ? (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Stationery Items</h2>
            <form onSubmit={handleAddItem} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Item Name
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 w-full justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </form>

            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">₹{item.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={loading}
                    className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <h2 className="text-xl font-semibold">Rush Hours Management</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Select a date and time slots to manage rush hours
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-6">
              <TimeSlotGrid
                selectedDate={selectedDate}
                onTimeSlotSelect={setSelectedTimeSlot}
                selectedTimeSlot={selectedTimeSlot}
                rushStatus={rushStatus}
              />

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Rush Status for Selected Time Slot
                  </label>
                  <select
                    value={rushStatus}
                    onChange={(e) => setRushStatus(e.target.value as 'high' | 'medium' | 'low')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="low">Low Rush (Green)</option>
                    <option value="medium">Medium Rush (Orange)</option>
                    <option value="high">High Rush (Red)</option>
                  </select>
                </div>
                <button
                  onClick={handleUpdateRushStatus}
                  disabled={loading || !selectedTimeSlot}
                  className="mt-6 px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Update Status
                </button>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-100"></div>
                  <span className="text-sm">High Rush</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-100"></div>
                  <span className="text-sm">Medium Rush</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100"></div>
                  <span className="text-sm">Low Rush</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                  <span className="text-sm">Past Time</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}