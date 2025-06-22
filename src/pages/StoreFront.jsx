import React, { useState, useEffect } from 'react';
import { Calendar } from '../components/Calendar.jsx';
import { StationeryItem } from '../components/StationeryItem.jsx';
import { TimeSlotPicker } from '../components/TimeSlotPicker.jsx';
import { PaymentModal } from '../components/PaymentModal.jsx';
import { OrderStatusCheck } from '../components/OrderStatusCheck.jsx';


import { ShoppingCart, Settings, Loader2, AlertCircle, Info, Package } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { useNavigate } from 'react-router-dom';
import { loadRazorpayScript } from '../utils/razorpay.js';
import { generateOrderNumber, formatOrderNumber, ORDER_STATUS } from '../utils/orderNumber.js';
import { validateStockAvailability, updateStockAfterOrder } from '../utils/stockManager.js';


export function StoreFront() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [rushStatus, setRushStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState(null);
  const [showOrderStatus, setShowOrderStatus] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchItems(),
          fetchRushStatus(),
          loadRazorpayScript().catch(err => console.warn('Razorpay script loading failed:', err))
        ]);
      } catch (err) {
        setError('Failed to load data. Please refresh the page.');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Refetch rush status when date changes
  useEffect(() => {
    fetchRushStatus();
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchItems = async () => {
    if (!isSupabaseConfigured) {
      // Demo data when Supabase is not configured
      const demoItems = [
        { id: 1, name: 'Notebook', price: 25.99, stock_quantity: 50 },
        { id: 2, name: 'Pen Set', price: 15.50, stock_quantity: 30 },
        { id: 3, name: 'Highlighters', price: 12.00, stock_quantity: 3 }, // Low stock example
        { id: 4, name: 'Sticky Notes', price: 8.75, stock_quantity: 100 },
        { id: 5, name: 'Stapler', price: 22.00, stock_quantity: 0 }, // Out of stock example
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
      console.error('Error fetching items:', error);
      throw error;
    }

    setItems(data || []);
  };

  const fetchRushStatus = async () => {
    if (!isSupabaseConfigured) {
      // Demo rush status data with time slots
      const demoRushStatus = {
        '9:00 AM': 'high',
        '9:10 AM': 'high',
        '9:20 AM': 'high',
        '10:00 AM': 'medium',
        '10:10 AM': 'medium',
        '2:00 PM': 'low',
        '2:10 PM': 'low',
        '3:00 PM': 'medium'
      };
      setRushStatus(demoRushStatus);
      return;
    }

    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('rush_status')
      .select('*')
      .eq('date', selectedDateStr);

    if (error) {
      console.error('Error fetching rush status:', error);
      throw error;
    }

    // Convert to time slot -> status mapping
    const statusMap = (data || []).reduce((acc, curr) => {
      acc[curr.time_slot] = curr.status;
      return acc;
    }, {});
    setRushStatus(statusMap);
  };

  const handleQuantityChange = (id, newQuantity) => {
    setQuantities(prev => ({
      ...prev,
      [id]: newQuantity
    }));
  };

  const totalCost = items.reduce((sum, item) => {
    return sum + (item.price * (quantities[item.id] || 0));
  }, 0);

  const handleBooking = async () => {
    if (!customerName.trim()) {
      alert('Please enter your name');
      return;
    }

    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }

    const selectedItems = items.filter(item => quantities[item.id] > 0);
    if (selectedItems.length === 0) {
      alert('Please select at least one item');
      return;
    }

    // Validate stock availability before proceeding
    setBookingLoading(true);
    try {
      const stockValidation = await validateStockAvailability(selectedItems.map(item => ({
        id: item.id,
        name: item.name,
        quantity: quantities[item.id]
      })));

      if (!stockValidation.valid) {
        alert(`❌ Stock Validation Failed:\n\n${stockValidation.details ? stockValidation.details.join('\n') : stockValidation.message}\n\nPlease adjust your quantities and try again.`);
        setBookingLoading(false);
        return;
      }

      // Prepare booking data
      const bookingData = {
        customer_name: customerName.trim(),
        date: selectedDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        time_slot: selectedSlot,
        items: selectedItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: quantities[item.id]
        })),
        total_cost: totalCost
      };

      // Store booking data and show payment modal
      setPendingBookingData(bookingData);
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Error validating stock:', error);
      alert('Failed to validate stock availability. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePaymentComplete = async (paymentResult) => {
    setBookingLoading(true);
    try {
      // Generate order number for both demo and real mode
      const orderNumber = generateOrderNumber();
      const formattedOrderNumber = formatOrderNumber(orderNumber);

      if (!isSupabaseConfigured) {
        // Demo mode - simulate booking with order number
        await new Promise(resolve => setTimeout(resolve, 1000));
        setShowPaymentModal(false);

        const paymentMethod = paymentResult.method === 'online' ? 'Online Payment' : 'Cash on Delivery';
        const paymentStatus = paymentResult.status === 'completed' ? 'Successful' : 'Pending';

        alert(`✅ Booking Confirmed!\n\nOrder Number: ${formattedOrderNumber}\nCustomer: ${pendingBookingData.customer_name}\nDate: ${selectedDate.toLocaleDateString()}\nTime: ${selectedSlot}\nTotal: ₹${totalCost.toFixed(2)}\nPayment: ${paymentMethod} (${paymentStatus})\n\n📝 Please save your order number for future reference.\n\nNote: This is a demo. Configure Supabase to enable real bookings.`);

        // In demo mode, simulate stock reduction by updating local state
        setItems(prevItems =>
          prevItems.map(item => {
            const orderedItem = pendingBookingData.items.find(orderItem => orderItem.id === item.id);
            if (orderedItem) {
              return {
                ...item,
                stock_quantity: Math.max(0, item.stock_quantity - orderedItem.quantity)
              };
            }
            return item;
          })
        );

        // Reset form
        setQuantities({});
        setSelectedSlot(null);
        setCustomerName('');
        setPendingBookingData(null);
        return;
      }

      // Prepare complete booking data with payment info and order number
      const completeBookingData = {
        ...pendingBookingData,
        order_number: orderNumber,
        order_status: ORDER_STATUS.PENDING, // Default status is pending
        payment_method: paymentResult.method,
        payment_status: paymentResult.status,
        payment_id: paymentResult.paymentId,
        payment_amount: paymentResult.amount,
        payment_currency: 'INR',
        payment_completed_at: paymentResult.status === 'completed' ? new Date().toISOString() : null
      };

      console.log('📤 Sending booking data to Supabase:', completeBookingData);

      const { data, error } = await supabase
        .from('bookings')
        .insert(completeBookingData)
        .select();

      if (error) {
        console.error('❌ Supabase error details:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error details:', error.details);
        console.error('❌ Error hint:', error.hint);
        throw error;
      }

      console.log('📥 Received booking response from Supabase:', data);

      // Update stock quantities after successful booking
      console.log('📦 Updating stock quantities...');
      const stockUpdateResult = await updateStockAfterOrder(pendingBookingData.items);

      if (!stockUpdateResult.success) {
        console.error('⚠️ Stock update failed:', stockUpdateResult.error);
        // Note: We don't fail the booking if stock update fails, just log it
      } else {
        console.log('✅ Stock updated successfully');
      }

      setShowPaymentModal(false);

      const insertedOrderNumber = data[0]?.order_number || orderNumber;
      const finalFormattedOrderNumber = formatOrderNumber(insertedOrderNumber);
      const paymentMethod = paymentResult.method === 'online' ? 'Online Payment' : 'Cash on Delivery';
      const paymentStatus = paymentResult.status === 'completed' ? 'Successful' : 'Pending';

      alert(`✅ Booking Confirmed!\n\nOrder Number: ${finalFormattedOrderNumber}\nCustomer: ${pendingBookingData.customer_name}\nDate: ${selectedDate.toLocaleDateString()}\nTime: ${selectedSlot}\nTotal: ₹${totalCost.toFixed(2)}\nPayment: ${paymentMethod} (${paymentStatus})\n\n${paymentResult.paymentId ? `Payment ID: ${paymentResult.paymentId}\n` : ''}📝 Please save your order number for future reference.`);

      // Refresh items to show updated stock
      await fetchItems();

      // Reset form
      setQuantities({});
      setSelectedSlot(null);
      setCustomerName('');
      setPendingBookingData(null);

    } catch (error) {
      console.error('Error creating booking:', error);

      // Show more specific error message with fallback option
      let errorMessage = 'Failed to create booking. Please try again.';
      let showDemoFallback = false;

      if (error.message) {
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          errorMessage = 'Database configuration issue. The database schema needs to be updated.\n\nWould you like to:\n1. Run the database setup script in Supabase SQL Editor\n2. Continue in demo mode for now';
          showDemoFallback = true;
        } else if (error.message.includes('permission') || error.message.includes('RLS')) {
          errorMessage = 'Permission denied. Database policies need to be configured.\n\nPlease run the database setup script in Supabase SQL Editor.';
          showDemoFallback = true;
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else {
          errorMessage = `Booking failed: ${error.message}\n\nPlease check your database configuration.`;
          showDemoFallback = true;
        }
      }

      if (showDemoFallback) {
        const useDemoMode = confirm(`${errorMessage}\n\nClick OK to continue in demo mode, or Cancel to try again.`);
        if (useDemoMode) {
          // Simulate demo mode booking
          setShowPaymentModal(false);
          const formattedOrderNumber = formatOrderNumber(orderNumber);
          const paymentMethod = paymentResult.method === 'online' ? 'Online Payment' : 'Cash on Delivery';
          const paymentStatus = paymentResult.status === 'completed' ? 'Successful' : 'Pending';

          alert(`✅ Booking Confirmed! (Demo Mode)\n\nOrder Number: ${formattedOrderNumber}\nCustomer: ${pendingBookingData.customer_name}\nDate: ${selectedDate.toLocaleDateString()}\nTime: ${selectedSlot}\nTotal: ₹${totalCost.toFixed(2)}\nPayment: ${paymentMethod} (${paymentStatus})\n\n📝 Please save your order number for future reference.\n\nNote: This booking was saved in demo mode. Configure Supabase to enable real bookings.`);

          // Reset form
          setQuantities({});
          setSelectedSlot(null);
          setCustomerName('');
          setPendingBookingData(null);
          return;
        }
      } else {
        alert(errorMessage);
      }

      setShowPaymentModal(false);
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
    setPendingBookingData(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading stationery items...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Stationery Store</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOrderStatus(!showOrderStatus)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                showOrderStatus
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Package className="w-5 h-5" />
              <span className="text-sm">Check Order Status</span>
            </button>
            <button
              onClick={() => navigate('/admin/login')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">Admin</span>
            </button>
          </div>
        </div>
      </header>

      {!isSupabaseConfigured && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="max-w-7xl mx-auto flex">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Demo Mode:</strong> Supabase is not configured. The app is running with mock data.
                  To enable full functionality, please set your Supabase credentials in <code className="bg-blue-100 px-1 rounded">.env.local</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {showOrderStatus ? (
          <OrderStatusCheck />
        ) : (
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
            <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="mb-6">
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  required
                />
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Select Date</h3>
                <Calendar
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  rushStatus={rushStatus}
                />
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Available Time Slots</h3>
                <TimeSlotPicker
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  onSlotSelect={setSelectedSlot}
                  rushStatus={rushStatus}
                />
              </div>

              <button
                onClick={handleBooking}
                disabled={bookingLoading || !customerName.trim() || !selectedSlot || totalCost === 0}
                className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>

              {/* Help text */}
              {(!customerName.trim() || !selectedSlot || totalCost === 0) && !bookingLoading && (
                <div className="mt-2 text-sm text-gray-600 text-center">
                  {!customerName.trim() && !selectedSlot && totalCost === 0 && "Please enter your name, select items and a time slot"}
                  {!customerName.trim() && selectedSlot && totalCost > 0 && "Please enter your name"}
                  {customerName.trim() && !selectedSlot && totalCost === 0 && "Please select items and a time slot"}
                  {customerName.trim() && !selectedSlot && totalCost > 0 && "Please select a time slot"}
                  {customerName.trim() && selectedSlot && totalCost === 0 && "Please select at least one item"}
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </main>

      {/* Payment Modal */}
      {showPaymentModal && pendingBookingData && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentModalClose}
          bookingData={pendingBookingData}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}
