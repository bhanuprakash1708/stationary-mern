// Stock management utilities

import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

// Update stock quantities after an order is placed
export const updateStockAfterOrder = async (orderItems) => {
  if (!isSupabaseConfigured) {
    // In demo mode, we can't persist stock changes
    console.log('📦 Demo Mode: Stock would be reduced for:', orderItems);
    return { success: true, message: 'Stock updated (Demo Mode)' };
  }

  try {
    // Process each item in the order
    for (const item of orderItems) {
      const { error } = await supabase.rpc('reduce_stock', {
        item_id: item.id,
        quantity_used: item.quantity
      });

      if (error) {
        console.error(`Error reducing stock for item ${item.id}:`, error);
        throw error;
      }
    }

    return { success: true, message: 'Stock updated successfully' };
  } catch (error) {
    console.error('Error updating stock:', error);
    return { success: false, message: 'Failed to update stock', error };
  }
};

// Check if items have sufficient stock before placing order
export const validateStockAvailability = async (orderItems) => {
  if (!isSupabaseConfigured) {
    // In demo mode, assume stock is available
    return { valid: true, message: 'Stock validation passed (Demo Mode)' };
  }

  try {
    // Get current stock levels for all items in the order
    const itemIds = orderItems.map(item => item.id);
    const { data: currentStock, error } = await supabase
      .from('stationery_items')
      .select('id, name, stock_quantity')
      .in('id', itemIds);

    if (error) {
      throw error;
    }

    // Check each item's availability
    const insufficientStock = [];
    for (const orderItem of orderItems) {
      const stockItem = currentStock.find(stock => stock.id === orderItem.id);
      if (!stockItem) {
        insufficientStock.push(`${orderItem.name}: Item not found`);
        continue;
      }

      if (stockItem.stock_quantity < orderItem.quantity) {
        insufficientStock.push(
          `${orderItem.name}: Requested ${orderItem.quantity}, only ${stockItem.stock_quantity} available`
        );
      }
    }

    if (insufficientStock.length > 0) {
      return {
        valid: false,
        message: 'Insufficient stock for some items',
        details: insufficientStock
      };
    }

    return { valid: true, message: 'Stock validation passed' };
  } catch (error) {
    console.error('Error validating stock:', error);
    return { valid: false, message: 'Failed to validate stock', error };
  }
};

// Get current stock levels for display
export const getCurrentStockLevels = async (itemIds = null) => {
  if (!isSupabaseConfigured) {
    // Return demo stock levels
    const demoStock = {
      1: 50, 2: 30, 3: 3, 4: 100, 5: 0, 6: 200, 7: 40, 8: 75
    };
    return { success: true, stock: demoStock };
  }

  try {
    let query = supabase
      .from('stationery_items')
      .select('id, stock_quantity');

    if (itemIds) {
      query = query.in('id', itemIds);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Convert to id -> stock_quantity mapping
    const stockMap = {};
    data.forEach(item => {
      stockMap[item.id] = item.stock_quantity;
    });

    return { success: true, stock: stockMap };
  } catch (error) {
    console.error('Error getting stock levels:', error);
    return { success: false, error };
  }
};

// Format stock status for display
export const getStockStatus = (quantity) => {
  if (quantity === 0) {
    return { status: 'out_of_stock', text: 'Out of Stock', color: 'text-red-600 bg-red-50' };
  } else if (quantity <= 5) {
    return { status: 'low_stock', text: `Only ${quantity} left`, color: 'text-orange-600 bg-orange-50' };
  } else {
    return { status: 'in_stock', text: `${quantity} in stock`, color: 'text-green-600 bg-green-50' };
  }
};
