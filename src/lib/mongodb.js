import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';

const mongoUrl = import.meta.env.VITE_MONGODB_URI;
const jwtSecret = import.meta.env.VITE_JWT_SECRET || 'your-jwt-secret-key';

// Check if we're in development with placeholder values
const isPlaceholder = (value) => {
  return !value ||
         value === 'your_mongodb_uri_here' ||
         value === 'mongodb://localhost:27017/stationery' ||
         value.includes('your-mongodb') ||
         value.includes('your_');
};

// Validate environment variables
if (!mongoUrl || isPlaceholder(mongoUrl)) {
  console.warn('⚠️  VITE_MONGODB_URI is not configured. Please set your MongoDB URI in .env.local');
}

// MongoDB client instance
let client = null;
let db = null;

// Initialize MongoDB connection
const initMongoDB = async () => {
  if (!client && mongoUrl && !isPlaceholder(mongoUrl)) {
    try {
      client = new MongoClient(mongoUrl);
      await client.connect();
      db = client.db('stationery_management');
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      client = null;
      db = null;
    }
  }
};

// Get database instance
const getDB = async () => {
  if (!db) {
    await initMongoDB();
  }
  return db;
};

// Create a mock database for development if MongoDB is not configured
const createMockDB = () => {
  const mockData = {
    stationery_items: [
      { _id: '1', name: 'Notebook', price: 25.99, stock_quantity: 50, created_at: new Date() },
      { _id: '2', name: 'Pen Set', price: 15.50, stock_quantity: 30, created_at: new Date() },
      { _id: '3', name: 'Highlighters', price: 12.00, stock_quantity: 3, created_at: new Date() },
      { _id: '4', name: 'Sticky Notes', price: 8.75, stock_quantity: 100, created_at: new Date() },
      { _id: '5', name: 'Stapler', price: 22.00, stock_quantity: 0, created_at: new Date() },
      { _id: '6', name: 'Paper Clips', price: 5.25, stock_quantity: 200, created_at: new Date() },
      { _id: '7', name: 'Ruler', price: 7.50, stock_quantity: 40, created_at: new Date() },
      { _id: '8', name: 'Eraser', price: 3.00, stock_quantity: 75, created_at: new Date() }
    ],
    bookings: [],
    rush_status: []
  };

  return {
    collection: (name) => ({
      find: (query = {}) => ({
        sort: () => ({
          toArray: () => Promise.resolve(mockData[name] || [])
        }),
        toArray: () => Promise.resolve(mockData[name] || [])
      }),
      findOne: (query) => Promise.resolve(mockData[name]?.[0] || null),
      insertOne: (doc) => {
        const newDoc = { ...doc, _id: Date.now().toString() };
        mockData[name] = mockData[name] || [];
        mockData[name].push(newDoc);
        return Promise.resolve({ insertedId: newDoc._id });
      },
      updateOne: () => Promise.resolve({ modifiedCount: 1 }),
      deleteOne: () => Promise.resolve({ deletedCount: 1 })
    })
  };
};

// MongoDB database operations wrapper
export const mongodb = {
  // Get collection
  collection: async (name) => {
    const database = await getDB();
    if (!database) {
      return createMockDB().collection(name);
    }
    return database.collection(name);
  },

  // Authentication methods
  auth: {
    getSession: () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return Promise.resolve({ data: { session: null }, error: null });

      try {
        const decoded = jwt.verify(token, jwtSecret);
        return Promise.resolve({
          data: { session: { user: decoded } },
          error: null
        });
      } catch (error) {
        localStorage.removeItem('auth_token');
        return Promise.resolve({ data: { session: null }, error: null });
      }
    },

    signInWithPassword: async ({ email, password }) => {
      // Simple demo authentication - in production, verify against database
      if (email === 'admin@example.com' && password === 'admin123') {
        const token = jwt.sign({ email, id: 'admin' }, jwtSecret, { expiresIn: '24h' });
        localStorage.setItem('auth_token', token);
        return Promise.resolve({ error: null });
      }
      return Promise.resolve({ error: new Error('Invalid credentials') });
    },

    signOut: () => {
      localStorage.removeItem('auth_token');
      return Promise.resolve({ error: null });
    },

    onAuthStateChange: (callback) => {
      // Simple implementation - in production, use proper event system
      const checkAuth = () => {
        const token = localStorage.getItem('auth_token');
        const session = token ? { user: jwt.decode(token) } : null;
        callback('SIGNED_IN', session);
      };

      checkAuth();
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  }
};

// Export a flag to check if MongoDB is properly configured
export const isMongoDBConfigured = !(!mongoUrl || isPlaceholder(mongoUrl));

// Initialize connection on module load
if (typeof window !== 'undefined') {
  initMongoDB();
}
