// Stock management utilities

import { mongodb, isMongoDBConfigured } from '../lib/mongodb.js';

// Update stock quantities after an order is placed
export const updateStockAfterOrder = async (orderItems) => {
  if (!isMongoDBConfigured) {
    // In demo mode, we can't persist stock changes
    console.log('📦 Demo Mode: Stock would be reduced for:', orderItems);
    return { success: true, message: 'Stock updated (Demo Mode)' };
  }

  try {
    const collection = await mongodb.collection('stationery_items');

    // Process each item in the order
    for (const item of orderItems) {
      const result = await collection.updateOne(
        { _id: item.id },
        {
          $inc: { stock_quantity: -item.quantity },
          $max: { stock_quantity: 0 } // Ensure stock doesn't go below 0
        }
      );

      if (result.matchedCount === 0) {
        console.error(`Item with id ${item.id} not found`);
        throw new Error(`Item with id ${item.id} not found`);
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
  if (!isMongoDBConfigured) {
    // In demo mode, assume stock is available
    return { valid: true, message: 'Stock validation passed (Demo Mode)' };
  }

  try {
    const collection = await mongodb.collection('stationery_items');

    // Get current stock levels for all items in the order
    const itemIds = orderItems.map(item => item.id);
    const currentStock = await collection.find({
      _id: { $in: itemIds }
    }).toArray();

    // Check each item's availability
    const insufficientStock = [];
    for (const orderItem of orderItems) {
      const stockItem = currentStock.find(stock => stock._id.toString() === orderItem.id);
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
  if (!isMongoDBConfigured) {
    // Return demo stock levels
    const demoStock = {
      1: 50, 2: 30, 3: 3, 4: 100, 5: 0, 6: 200, 7: 40, 8: 75
    };
    return { success: true, stock: demoStock };
  }

  try {
    const collection = await mongodb.collection('stationery_items');

    let query = {};
    if (itemIds) {
      query = { _id: { $in: itemIds } };
    }

    const data = await collection.find(query, {
      projection: { _id: 1, stock_quantity: 1 }
    }).toArray();

    // Convert to id -> stock_quantity mapping
    const stockMap = {};
    data.forEach(item => {
      stockMap[item._id.toString()] = item.stock_quantity;
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
