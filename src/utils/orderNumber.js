// Utility functions for order number generation and management

// Generate order number in format: month_year_orderNumber
// Example: 05_2025_001, 05_2025_002, etc.
export const generateOrderNumber = () => {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString();

  // Generate a random 3-digit number for uniqueness
  // In a real system, this would be sequential from database
  const orderNum = Math.floor(Math.random() * 900) + 100; // 100-999

  return `${month}_${year}_${orderNum.toString().padStart(3, '0')}`;
};

// Format order number for display (keeps the underscore format)
export const formatOrderNumber = (orderNumber) => {
  if (!orderNumber) return '';
  return orderNumber; // Keep the format as is: 05_2025_001
};

// Validate order number format
export const isValidOrderNumber = (orderNumber) => {
  if (!orderNumber) return false;

  // Should be MM_YYYY_NNN format
  const pattern = /^\d{2}_\d{4}_\d{3}$/;
  return pattern.test(orderNumber);
};

// Search/filter function for order numbers
export const searchOrderNumbers = (orders, searchTerm) => {
  if (!searchTerm) return orders;

  const term = searchTerm.toLowerCase().replace(/[_\s]/g, ''); // Remove underscores and spaces

  return orders.filter(order => {
    const orderNum = order.order_number?.toLowerCase().replace(/[_\s]/g, '') || '';
    const customerName = order.customer_name?.toLowerCase() || '';
    const orderId = order.id?.toString() || '';

    return orderNum.includes(term) ||
           customerName.includes(searchTerm.toLowerCase()) ||
           orderId.includes(term);
  });
};

// Get order number from various formats
export const normalizeOrderNumber = (input) => {
  if (!input) return '';

  // Remove spaces and convert to uppercase
  const normalized = input.replace(/\s/g, '').toUpperCase();

  return normalized;
};

// Order status options
export const ORDER_STATUS = {
  PENDING: 'pending',
  TAKEN: 'taken',
  NOT_TAKEN: 'not_taken'
};

// Get status display text
export const getOrderStatusText = (status) => {
  switch (status) {
    case ORDER_STATUS.TAKEN:
      return 'Order Taken';
    case ORDER_STATUS.NOT_TAKEN:
      return 'Order Not Taken';
    case ORDER_STATUS.PENDING:
    default:
      return 'Pending Pickup';
  }
};

// Get status color classes
export const getOrderStatusColor = (status) => {
  switch (status) {
    case ORDER_STATUS.TAKEN:
      return 'bg-green-100 text-green-800';
    case ORDER_STATUS.NOT_TAKEN:
      return 'bg-red-100 text-red-800';
    case ORDER_STATUS.PENDING:
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};
