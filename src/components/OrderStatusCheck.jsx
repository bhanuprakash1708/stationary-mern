import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { formatOrderNumber, getOrderStatusText, getOrderStatusColor, ORDER_STATUS } from '../utils/orderNumber.js';
import { format } from 'date-fns';

export function OrderStatusCheck() {
  const [orderNumber, setOrderNumber] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!orderNumber.trim()) {
      setError('Please enter an order number');
      return;
    }

    setLoading(true);
    setError(null);
    setOrderData(null);

    try {
      if (!isSupabaseConfigured) {
        // Demo mode - simulate order lookup
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const demoOrders = [
          {
            id: 1,
            order_number: '05_2025_001',
            customer_name: 'John Doe',
            date: '2025-05-23',
            time_slot: '10:00 AM',
            items: [
              { name: 'Notebook', quantity: 2, price: 25.99 },
              { name: 'Pen Set', quantity: 1, price: 15.50 }
            ],
            total_cost: 67.48,
            order_status: ORDER_STATUS.PENDING,
            payment_method: 'online',
            payment_status: 'completed',
            created_at: '2025-05-23T10:30:00Z'
          },
          {
            id: 2,
            order_number: '05_2025_002',
            customer_name: 'Jane Smith',
            date: '2025-05-23',
            time_slot: '2:00 PM',
            items: [
              { name: 'Highlighters', quantity: 1, price: 12.00 }
            ],
            total_cost: 12.00,
            order_status: ORDER_STATUS.TAKEN,
            payment_method: 'cash_on_delivery',
            payment_status: 'not_required',
            created_at: '2025-05-23T11:15:00Z'
          },
          {
            id: 3,
            order_number: '05_2025_003',
            customer_name: 'Mike Johnson',
            date: '2025-05-24',
            time_slot: '11:00 AM',
            items: [
              { name: 'Stapler', quantity: 1, price: 22.00 }
            ],
            total_cost: 22.00,
            order_status: ORDER_STATUS.NOT_TAKEN,
            payment_method: 'online',
            payment_status: 'completed',
            created_at: '2025-05-24T09:45:00Z'
          }
        ];

        const foundOrder = demoOrders.find(order => 
          order.order_number.toLowerCase().replace(/[_\s]/g, '') === 
          orderNumber.toLowerCase().replace(/[_\s]/g, '')
        );

        if (foundOrder) {
          setOrderData(foundOrder);
        } else {
          setError('Order not found. Please check your order number and try again.');
        }
        return;
      }

      // Real Supabase lookup
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('order_number', orderNumber.trim())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Order not found. Please check your order number and try again.');
        } else {
          throw error;
        }
        return;
      }

      setOrderData(data);

    } catch (err) {
      console.error('Error searching for order:', err);
      setError('Failed to search for order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case ORDER_STATUS.TAKEN:
        return CheckCircle;
      case ORDER_STATUS.NOT_TAKEN:
        return XCircle;
      case ORDER_STATUS.PENDING:
      default:
        return Clock;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Check Order Status</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Your Order Number
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="orderNumber"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="e.g., 05_2025_001"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Check Status
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {orderData && (
              <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  {/* Order Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order {formatOrderNumber(orderData.order_number)}
                      </h3>
                      <p className="text-sm text-gray-600">Customer: {orderData.customer_name}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(orderData.order_status)}`}>
                      {React.createElement(getStatusIcon(orderData.order_status), { className: "w-4 h-4" })}
                      {getOrderStatusText(orderData.order_status)}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Booking Date & Time</p>
                      <p className="font-medium">{format(new Date(orderData.date), 'MMMM d, yyyy')} at {orderData.time_slot}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Placed</p>
                      <p className="font-medium">{format(new Date(orderData.created_at), 'MMMM d, yyyy h:mm a')}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Items Ordered</p>
                    <div className="space-y-2">
                      {orderData.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.name} × {item.quantity}</span>
                          <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-300 mt-2 pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>₹{orderData.total_cost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Message */}
                  <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                    {orderData.order_status === ORDER_STATUS.TAKEN && (
                      <p className="text-green-700">
                        ✅ Your order has been taken! Thank you for your business.
                      </p>
                    )}
                    {orderData.order_status === ORDER_STATUS.NOT_TAKEN && (
                      <p className="text-red-700">
                        ❌ Your order has not been taken yet. Please contact the store for assistance.
                      </p>
                    )}
                    {orderData.order_status === ORDER_STATUS.PENDING && (
                      <p className="text-yellow-700">
                        ⏳ Your order is ready for pickup. Please visit the store during business hours.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
