// MongoDB Database Initialization Script
// Run this script to set up the MongoDB database for the Stationery Management System

const { MongoClient } = require('mongodb');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = 'stationery_management';

async function initializeDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    console.log(`✅ Connected to database: ${DATABASE_NAME}`);
    
    // Create collections
    console.log('📦 Creating collections...');
    
    // 1. Create stationery_items collection
    const stationeryItems = db.collection('stationery_items');
    
    // 2. Create bookings collection
    const bookings = db.collection('bookings');
    
    // 3. Create rush_status collection
    const rushStatus = db.collection('rush_status');
    
    // 4. Create counters collection for order number generation
    const counters = db.collection('counters');
    
    console.log('📋 Creating indexes...');
    
    // Create indexes for stationery_items
    await stationeryItems.createIndex({ name: 1 });
    await stationeryItems.createIndex({ stock_quantity: 1 });
    console.log('✅ Created indexes for stationery_items');
    
    // Create indexes for bookings
    await bookings.createIndex({ order_number: 1 }, { unique: true });
    await bookings.createIndex({ customer_name: 1 });
    await bookings.createIndex({ date: 1 });
    await bookings.createIndex({ date: 1, time_slot: 1 });
    await bookings.createIndex({ created_at: -1 });
    console.log('✅ Created indexes for bookings');
    
    // Create indexes for rush_status
    await rushStatus.createIndex({ date: 1, time_slot: 1 }, { unique: true });
    console.log('✅ Created indexes for rush_status');
    
    console.log('🌱 Inserting initial data...');
    
    // Insert initial stationery items
    const initialItems = [
      {
        name: 'Notebook',
        price: 25.99,
        stock_quantity: 50,
        created_at: new Date()
      },
      {
        name: 'Pen Set',
        price: 15.50,
        stock_quantity: 30,
        created_at: new Date()
      },
      {
        name: 'Highlighters',
        price: 12.00,
        stock_quantity: 25,
        created_at: new Date()
      },
      {
        name: 'Sticky Notes',
        price: 8.75,
        stock_quantity: 100,
        created_at: new Date()
      },
      {
        name: 'Stapler',
        price: 22.00,
        stock_quantity: 15,
        created_at: new Date()
      },
      {
        name: 'Paper Clips',
        price: 5.25,
        stock_quantity: 200,
        created_at: new Date()
      },
      {
        name: 'Ruler',
        price: 7.50,
        stock_quantity: 40,
        created_at: new Date()
      },
      {
        name: 'Eraser',
        price: 3.00,
        stock_quantity: 75,
        created_at: new Date()
      }
    ];
    
    // Check if items already exist
    const existingItemsCount = await stationeryItems.countDocuments();
    if (existingItemsCount === 0) {
      await stationeryItems.insertMany(initialItems);
      console.log('✅ Inserted initial stationery items');
    } else {
      console.log('ℹ️  Stationery items already exist, skipping insertion');
    }
    
    // Initialize counter for order numbers
    const existingCounter = await counters.findOne({ _id: 'order_number' });
    if (!existingCounter) {
      await counters.insertOne({
        _id: 'order_number',
        sequence_value: 0
      });
      console.log('✅ Initialized order number counter');
    } else {
      console.log('ℹ️  Order number counter already exists');
    }
    
    console.log('🎉 Database initialization completed successfully!');
    console.log('\n📊 Database Summary:');
    console.log(`   • Database: ${DATABASE_NAME}`);
    console.log(`   • Collections: 4 (stationery_items, bookings, rush_status, counters)`);
    console.log(`   • Stationery Items: ${await stationeryItems.countDocuments()}`);
    console.log(`   • Bookings: ${await bookings.countDocuments()}`);
    console.log(`   • Rush Status: ${await rushStatus.countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

// Helper function to generate order numbers
async function getNextOrderNumber(db) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: 'order_number' },
    { $inc: { sequence_value: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString();
  const sequence = result.value.sequence_value.toString().padStart(3, '0');
  
  return `${month}_${year}_${sequence}`;
}

// Export for use in other scripts
module.exports = {
  initializeDatabase,
  getNextOrderNumber,
  MONGODB_URI,
  DATABASE_NAME
};

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}
