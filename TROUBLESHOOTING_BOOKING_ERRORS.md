# 🔧 Troubleshooting Booking Creation Errors

## Quick Fix Steps

### 1. **Run Database Setup Script**
1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Go to your project: `srnfszurrbcvoqkceofj`
3. Navigate to **SQL Editor**
4. Copy and paste the entire content from `add_order_number_column.sql`
5. Click **Run** to execute the script

### 2. **Common Error Messages & Solutions**

#### ❌ "column does not exist"
**Problem**: Database table is missing required columns
**Solution**: Run the database setup script above

#### ❌ "permission denied" or "RLS policy"
**Problem**: Row Level Security policies not configured
**Solution**: Run the database setup script (includes policy setup)

#### ❌ "network error" or "fetch failed"
**Problem**: Internet connection or Supabase service issue
**Solution**: Check internet connection, try again later

#### ❌ "Failed to create booking"
**Problem**: General database configuration issue
**Solution**: 
1. Run database setup script
2. If still failing, use demo mode fallback

### 3. **Demo Mode Fallback**
If you see a database error, the system will offer demo mode:
- Click **OK** to continue in demo mode
- Your booking will be simulated (not saved to database)
- You'll still get an order number for testing

### 4. **Verify Database Setup**
After running the setup script, check:

```sql
-- Check if all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('bookings', 'stationery_items', 'rush_status');

-- Check bookings table structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;
```

Expected columns in `bookings` table:
- `id` (integer)
- `customer_name` (text)
- `date` (date)
- `time_slot` (text)
- `items` (jsonb)
- `total_cost` (numeric)
- `order_number` (text)
- `payment_method` (text)
- `payment_status` (text)
- `payment_id` (text)
- `payment_amount` (numeric)
- `payment_currency` (text)
- `payment_completed_at` (timestamp)
- `created_at` (timestamp)

### 5. **Test Booking Flow**
1. Go to main store page
2. Enter customer name
3. Select items and quantities
4. Choose date and time slot
5. Click "Confirm Booking"
6. Choose payment method
7. Complete payment process
8. Should see success message with order number

### 6. **Check Browser Console**
If booking fails:
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for error messages starting with ❌
4. Share these details if you need support

### 7. **Environment Variables**
Ensure your `.env` file has correct Supabase credentials:
```
VITE_SUPABASE_URL=https://srnfszurrbcvoqkceofj.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key
```

### 8. **Contact Support**
If issues persist, provide:
- Error message from browser console
- Steps you tried
- Whether demo mode works
- Database setup script results
