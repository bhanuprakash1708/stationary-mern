# 🔄 Database Update Guide - Customer Name Feature

## New Features Added

### ✅ Customer Name Collection
- **StoreFront**: Now collects customer name before booking
- **Admin Orders**: Displays customer names in order management
- **Database**: Added `customer_name` column to bookings table

### ✅ Orders Management Component
- **View all orders** with customer details
- **Search orders** by customer name or order ID
- **Filter orders** by date
- **Delete orders** functionality
- **Revenue tracking** and statistics
- **Orders grouped by date** for better organization

## 🔧 Database Migration Required

### Step 1: Run the Migration
You need to add the `customer_name` column to your existing bookings table.

**Option A: Using Supabase Dashboard**
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the following SQL:

```sql
-- Add customer_name column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- Update existing records with a default value
UPDATE bookings SET customer_name = 'Anonymous Customer' WHERE customer_name IS NULL;

-- Make the column required for new records
ALTER TABLE bookings ALTER COLUMN customer_name SET NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_customer_name ON bookings(customer_name);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(date, time_slot);
```

4. Click **Run** to execute the migration

**Option B: Using Migration File**
The migration is also available in: `supabase/migrations/20250523_add_customer_name.sql`

### Step 2: Verify the Migration
After running the migration, verify it worked:

```sql
-- Check if the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bookings' AND column_name = 'customer_name';

-- Check existing data
SELECT id, customer_name, date, time_slot, total_cost 
FROM bookings 
ORDER BY created_at DESC 
LIMIT 5;
```

## 🎯 New User Experience

### Customer Booking Flow:
1. **Enter Name**: Customer enters their full name
2. **Select Items**: Add stationery items to cart
3. **Choose Date**: Select booking date from calendar
4. **Pick Time**: Choose available time slot
5. **Confirm Booking**: Submit with all details
6. **Get Confirmation**: Receive booking ID and details

### Admin Orders Management:
1. **View Orders**: See all customer orders with details
2. **Search & Filter**: Find specific orders quickly
3. **Track Revenue**: Monitor total sales and statistics
4. **Manage Orders**: Delete orders if needed
5. **Date Organization**: Orders grouped by date for clarity

## 📊 New Admin Dashboard Features

### Orders Tab (Default)
- **Statistics Cards**: Total orders, revenue, unique customers
- **Search Functionality**: Find orders by customer name or ID
- **Date Filtering**: Filter orders by specific dates
- **Order Details**: Complete order information including:
  - Customer name
  - Order date and time
  - Items ordered with quantities
  - Total cost
  - Order timestamp

### Enhanced UI
- **Professional Layout**: Clean, organized interface
- **Responsive Design**: Works on all screen sizes
- **Loading States**: Smooth user feedback
- **Error Handling**: Graceful error management

## 🔍 Data Structure

### Updated Bookings Table:
```sql
bookings (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,        -- NEW FIELD
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  items JSONB NOT NULL,
  total_cost NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

### Sample Order Data:
```json
{
  "id": 123,
  "customer_name": "John Doe",
  "date": "2025-05-23",
  "time_slot": "10:00 AM",
  "items": [
    {
      "id": 1,
      "name": "Notebook",
      "price": 25.99,
      "quantity": 2
    }
  ],
  "total_cost": 51.98,
  "created_at": "2025-05-23T10:30:00Z"
}
```

## 🚀 Testing the New Features

### Test Customer Booking:
1. Go to http://localhost:5173/
2. Enter your name in the "Your Name" field
3. Add items to cart
4. Select date and time slot
5. Click "Confirm Booking"
6. Verify you get confirmation with booking ID

### Test Admin Orders:
1. Go to http://localhost:5173/admin/login
2. Login to admin dashboard
3. Click on "Orders" tab (should be default)
4. Verify you can see the test booking
5. Try searching and filtering features
6. Check statistics are accurate

## 🎉 Benefits of New Features

### For Customers:
- **Personalized Experience**: Orders tied to their name
- **Better Confirmation**: Clear booking details with ID
- **Professional Service**: Name collection shows attention to detail

### For Admins:
- **Customer Tracking**: Know who placed each order
- **Better Organization**: Orders grouped and searchable
- **Business Insights**: Revenue tracking and customer metrics
- **Order Management**: Easy to find and manage specific orders

### For Business:
- **Customer Database**: Build customer relationship data
- **Analytics Ready**: Data structure supports future analytics
- **Professional Image**: Complete order management system
- **Scalability**: Ready for customer accounts and loyalty programs

## 🔧 Troubleshooting

### If Migration Fails:
1. Check your Supabase connection
2. Verify you have admin permissions
3. Try running each SQL statement individually
4. Check for existing column conflicts

### If Orders Don't Show:
1. Verify the migration ran successfully
2. Check that new bookings include customer_name
3. Refresh the admin dashboard
4. Check browser console for errors

### If Search Doesn't Work:
1. Ensure indexes were created
2. Try exact customer name matches
3. Check for case sensitivity issues
4. Verify the search implementation

The new customer name and orders management features are now ready to use! 🎊
