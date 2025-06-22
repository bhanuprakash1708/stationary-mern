import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { Calendar as CalendarIcon, Clock, User, Package, Trash2, Loader2, AlertCircle, Search, Filter, CreditCard, Banknote, CheckCircle, XCircle, Clock as ClockIcon, Hash } from 'lucide-react';
import { format } from 'date-fns';
import { formatOrderNumber, searchOrderNumbers, ORDER_STATUS, getOrderStatusText, getOrderStatusColor } from '../utils/orderNumber.js';

export function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured) {
        // Demo data for orders with payment information and order numbers
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
            payment_id: 'pay_demo123456',
            payment_amount: 67.48,
            payment_currency: 'INR',
            payment_completed_at: '2025-05-23T10:32:00Z',
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
            payment_id: null,
            payment_amount: 12.00,
            payment_currency: 'INR',
            payment_completed_at: null,
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
            payment_status: 'failed',
            payment_id: null,
            payment_amount: 22.00,
            payment_currency: 'INR',
            payment_completed_at: null,
            created_at: '2025-05-24T09:45:00Z'
          },
          {
            id: 4,
            order_number: '05_2025_004',
            customer_name: 'Sarah Wilson',
            date: '2025-05-24',
            time_slot: '3:00 PM',
            items: [
              { name: 'Ruler', quantity: 2, price: 7.50 },
              { name: 'Eraser', quantity: 3, price: 3.00 }
            ],
            total_cost: 24.00,
            order_status: ORDER_STATUS.PENDING,
            payment_method: 'online',
            payment_status: 'pending',
            payment_id: 'pay_pending123',
            payment_amount: 24.00,
            payment_currency: 'INR',
            payment_completed_at: null,
            created_at: '2025-05-24T15:20:00Z'
          },
          {
            id: 5,
            order_number: '05_2025_005',
            customer_name: 'David Brown',
            date: '2025-05-25',
            time_slot: '9:00 AM',
            items: [
              { name: 'Paper Clips', quantity: 5, price: 5.25 }
            ],
            total_cost: 26.25,
            order_status: ORDER_STATUS.TAKEN,
            payment_method: 'cash_on_delivery',
            payment_status: 'not_required',
            payment_id: null,
            payment_amount: 26.25,
            payment_currency: 'INR',
            payment_completed_at: null,
            created_at: '2025-05-25T09:15:00Z'
          },
          {
            id: 6,
            order_number: '05_2025_006',
            customer_name: 'Emily Davis',
            date: '2025-05-25',
            time_slot: '1:00 PM',
            items: [
              { name: 'Sticky Notes', quantity: 2, price: 8.75 }
            ],
            total_cost: 17.50,
            order_status: ORDER_STATUS.PENDING,
            payment_method: 'online',
            payment_status: 'completed',
            payment_id: 'pay_success789',
            payment_amount: 17.50,
            payment_currency: 'INR',
            payment_completed_at: '2025-05-25T13:05:00Z',
            created_at: '2025-05-25T13:00:00Z'
          }
        ];
        setOrders(demoOrders);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    if (!isSupabaseConfigured) {
      // Demo mode - just remove from local state
      setOrders(orders.filter(order => order.id !== orderId));
      return;
    }

    setDeleteLoading(orderId);
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', orderId);

      if (error) {
        throw error;
      }

      setOrders(orders.filter(order => order.id !== orderId));
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Failed to delete order. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setStatusUpdateLoading(orderId);
    try {
      if (!isSupabaseConfigured) {
        // Demo mode - just update local state
        setOrders(orders.map(order =>
          order.id === orderId
            ? { ...order, order_status: newStatus }
            : order
        ));
        return;
      }

      const { error } = await supabase
        .from('bookings')
        .update({ order_status: newStatus })
        .eq('id', orderId);

      if (error) {
        throw error;
      }

      // Update local state immediately for better UX
      setOrders(orders.map(order =>
        order.id === orderId
          ? { ...order, order_status: newStatus }
          : order
      ));

    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status. Please try again.');
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  const filteredOrders = searchOrderNumbers(orders, searchTerm).filter(order => {
    const matchesDate = !dateFilter || order.date === dateFilter;

    const matchesOrderStatus = orderStatusFilter === 'all' ||
      (order.order_status || ORDER_STATUS.PENDING) === orderStatusFilter;

    const matchesPaymentStatus = paymentStatusFilter === 'all' ||
      order.payment_status === paymentStatusFilter;

    return matchesDate && matchesOrderStatus && matchesPaymentStatus;
  });

  const getTotalRevenue = () => {
    return filteredOrders.reduce((sum, order) => sum + order.total_cost, 0);
  };

  const getOrdersByDate = () => {
    const ordersByDate = {};
    filteredOrders.forEach(order => {
      if (!ordersByDate[order.date]) {
        ordersByDate[order.date] = [];
      }
      ordersByDate[order.date].push(order);
    });
    return ordersByDate;
  };

  const getPaymentMethodIcon = (method) => {
    return method === 'online' ? CreditCard : Banknote;
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'failed':
        return XCircle;
      case 'pending':
        return ClockIcon;
      case 'not_required':
        return CheckCircle;
      default:
        return ClockIcon;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      case 'not_required':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPaymentStatusText = (method, status) => {
    if (method === 'cash_on_delivery') {
      return 'Cash on Delivery';
    }

    switch (status) {
      case 'completed':
        return 'Payment Successful';
      case 'failed':
        return 'Payment Failed';
      case 'pending':
        return 'Payment Pending';
      default:
        return 'Unknown Status';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">Error Loading Orders</h3>
          <p className="text-gray-600 max-w-md">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const ordersByDate = getOrdersByDate();

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">
                {(searchTerm || dateFilter || orderStatusFilter !== 'all' || paymentStatusFilter !== 'all')
                  ? 'Filtered Orders'
                  : 'Total Orders'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{filteredOrders.length}</p>
              {orders.length !== filteredOrders.length && (
                <p className="text-xs text-gray-500">of {orders.length} total</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{getTotalRevenue().toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(filteredOrders.map(order => order.customer_name)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Filter className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Quick Stats</p>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Pending: {filteredOrders.filter(o => (o.order_status || ORDER_STATUS.PENDING) === ORDER_STATUS.PENDING).length}</div>
                <div>Taken: {filteredOrders.filter(o => o.order_status === ORDER_STATUS.TAKEN).length}</div>
                <div>Not Taken: {filteredOrders.filter(o => o.order_status === ORDER_STATUS.NOT_TAKEN).length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="space-y-4">
          {/* Search and Date Filter Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by customer name, order number, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="sm:w-48">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Filter by date"
              />
            </div>
          </div>

          {/* Status Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">All Order Status</option>
                  <option value={ORDER_STATUS.PENDING}>Pending Pickup</option>
                  <option value={ORDER_STATUS.TAKEN}>Order Taken</option>
                  <option value={ORDER_STATUS.NOT_TAKEN}>Order Not Taken</option>
                </select>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">All Payment Status</option>
                  <option value="completed">Payment Successful</option>
                  <option value="pending">Payment Pending</option>
                  <option value="failed">Payment Failed</option>
                  <option value="not_required">Cash on Delivery</option>
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(dateFilter || orderStatusFilter !== 'all' || paymentStatusFilter !== 'all') && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setDateFilter('');
                    setOrderStatusFilter('all');
                    setPaymentStatusFilter('all');
                  }}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          {(dateFilter || orderStatusFilter !== 'all' || paymentStatusFilter !== 'all') && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">Active filters:</span>
              {dateFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Date: {format(new Date(dateFilter), 'MMM d, yyyy')}
                  <button
                    onClick={() => setDateFilter('')}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
              {orderStatusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Order: {getOrderStatusText(orderStatusFilter)}
                  <button
                    onClick={() => setOrderStatusFilter('all')}
                    className="hover:bg-green-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
              {paymentStatusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Payment: {getPaymentStatusText('online', paymentStatusFilter)}
                  <button
                    onClick={() => setPaymentStatusFilter('all')}
                    className="hover:bg-purple-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-600">
            {(searchTerm || dateFilter || orderStatusFilter !== 'all' || paymentStatusFilter !== 'all')
              ? 'No orders match your current filters. Try adjusting or clearing your filters.'
              : 'No orders have been placed yet.'}
          </p>
          {(searchTerm || dateFilter || orderStatusFilter !== 'all' || paymentStatusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDateFilter('');
                setOrderStatusFilter('all');
                setPaymentStatusFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(ordersByDate).map(([date, dateOrders]) => (
            <div key={date} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                </h3>
                <p className="text-sm text-gray-600">
                  {dateOrders.length} order{dateOrders.length !== 1 ? 's' : ''} •
                  ₹{dateOrders.reduce((sum, order) => sum + order.total_cost, 0).toFixed(2)} total
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {dateOrders.map((order) => (
                  <div key={order.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex flex-col">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {order.customer_name}
                            </h4>
                            {order.order_number && (
                              <div className="flex items-center gap-1 text-sm font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1">
                                <Hash className="w-3 h-3" />
                                <span className="font-semibold">{formatOrderNumber(order.order_number)}</span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded" title="Database ID">
                            ID #{order.id}
                          </span>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            {order.time_slot}
                          </div>

                          {/* Payment Status Badge */}
                          <div className={`flex items-center gap-1 text-sm ${getPaymentStatusColor(order.payment_status)}`}>
                            {React.createElement(getPaymentMethodIcon(order.payment_method), { className: "w-4 h-4" })}
                            {React.createElement(getPaymentStatusIcon(order.payment_status), { className: "w-4 h-4" })}
                            <span className="font-medium">
                              {getPaymentStatusText(order.payment_method, order.payment_status)}
                            </span>
                          </div>

                          {/* Order Status Badge */}
                          <div className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${getOrderStatusColor(order.order_status || ORDER_STATUS.PENDING)}`}>
                            <span className="font-medium">
                              {getOrderStatusText(order.order_status || ORDER_STATUS.PENDING)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-700">
                                {item.name} × {item.quantity}
                              </span>
                              <span className="text-gray-900 font-medium">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-start">
                            <div className="text-sm text-gray-600">
                              <p>Ordered: {format(new Date(order.created_at), 'h:mm a')}</p>
                              {order.order_number && (
                                <p className="mt-1">Order Number: <span className="font-mono text-sm font-semibold text-blue-700">{formatOrderNumber(order.order_number)}</span></p>
                              )}
                              {order.payment_id && (
                                <p className="mt-1">Payment ID: <span className="font-mono text-xs">{order.payment_id}</span></p>
                              )}
                              {order.payment_completed_at && (
                                <p className="mt-1">Paid: {format(new Date(order.payment_completed_at), 'h:mm a')}</p>
                              )}
                            </div>
                            <span className="text-lg font-bold text-gray-900">
                              Total: ₹{order.total_cost.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Order Status Controls */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Update Order Status:</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, ORDER_STATUS.TAKEN)}
                                  disabled={statusUpdateLoading === order.id || order.order_status === ORDER_STATUS.TAKEN}
                                  className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  {statusUpdateLoading === order.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    'Mark as Taken'
                                  )}
                                </button>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, ORDER_STATUS.NOT_TAKEN)}
                                  disabled={statusUpdateLoading === order.id || order.order_status === ORDER_STATUS.NOT_TAKEN}
                                  className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  {statusUpdateLoading === order.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    'Mark as Not Taken'
                                  )}
                                </button>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, ORDER_STATUS.PENDING)}
                                  disabled={statusUpdateLoading === order.id || order.order_status === ORDER_STATUS.PENDING}
                                  className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  {statusUpdateLoading === order.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    'Reset to Pending'
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        disabled={deleteLoading === order.id}
                        className="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete order"
                      >
                        {deleteLoading === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
