import React, { useState, useEffect } from 'react';
import { Calendar } from '../components/Calendar';
import { StationeryItem } from '../components/StationeryItem';
import { TimeSlotPicker } from '../components/TimeSlotPicker';
import { ShoppingCart, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface StationeryItemType {
  id: number;
  name: string;
  price: number;
}

export function StoreFront() {
  const navigate = useNavigate();
  const [items, setItems] = useState<StationeryItemType[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [rushStatus, setRushStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchItems();
    fetchRushStatus();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('stationery_items')
      .select('*');
    if (error) {
      console.error('Error fetching items:', error);
      return;
    }
    setItems(data);
  };

  const fetchRushStatus = async () => {
    const { data, error } = await supabase
      .from('rush_status')
      .select('*');
    if (error) {
      console.error('Error fetching rush status:', error);
      return;
    }
    const statusMap = data.reduce((acc, curr) => {
      acc[curr.date] = curr.status;
      return acc;
    }, {});
    setRushStatus(statusMap);
  };

  const handleQuantityChange = (id: number, newQuantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: newQuantity
    }));
  };

  const totalCost = items.reduce((sum, item) => {
    return sum + (item.price * (quantities[item.id] || 0));
  }, 0);

  const handleBooking = async () => {
    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }

    const selectedItems = items.filter(item => quantities[item.id] > 0);
    if (selectedItems.length === 0) {
      alert('Please select at least one item');
      return;
    }

    const { error } = await supabase
      .from('bookings')
      .insert({
        date: selectedDate,
        time_slot: selectedSlot,
        items: selectedItems.map(item => ({
          id: item.id,
          quantity: quantities[item.id]
        })),
        total_cost: totalCost
      });

    if (error) {
      alert('Error creating booking');
      return;
    }

    alert(`Booking confirmed for ${selectedDate.toLocaleDateString()} at ${selectedSlot}`);
    setQuantities({});
    setSelectedSlot(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Stationery Store</h1>
          <button
            onClick={() => navigate('/admin/login')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Admin</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Available Items</h2>
            <div className="space-y-4">
              {items.map(item => (
                <StationeryItem
                  key={item.id}
                  {...item}
                  quantity={quantities[item.id] || 0}
                  onQuantityChange={handleQuantityChange}
                />
              ))}
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="font-semibold">Total Cost:</span>
                </div>
                <span className="text-xl font-bold">₹{totalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Select Date & Time</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Calendar
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                rushStatus={rushStatus}
              />
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Available Time Slots</h3>
                <TimeSlotPicker
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  onSlotSelect={setSelectedSlot}
                />
              </div>

              <button
                onClick={handleBooking}
                className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}