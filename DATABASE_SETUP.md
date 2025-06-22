# Database Setup Instructions

## Quick Setup (5 minutes)

### Step 1: Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Open your project dashboard

### Step 2: Run Database Migration
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/migrations/20250221235641_wooden_tower.sql`
4. Paste it into the SQL editor
5. Click **Run** to execute the migration

### Step 3: Add Initial Data (Optional)
After running the migration, you can add some sample data:

```sql
-- Add sample stationery items
INSERT INTO stationery_items (name, price) VALUES
('Notebook (A4)', 25.99),
('Pen Set (Blue/Black)', 15.50),
('Highlighter Set', 12.00),
('Sticky Notes Pack', 8.75),
('Stapler', 22.00),
('Paper Clips Box', 5.25),
('Ruler (30cm)', 3.50),
('Eraser Set', 4.75),
('Pencil Set', 9.99),
('Folder Set', 18.50);

-- Add sample rush status
INSERT INTO rush_status (date, time_slot, status) VALUES
(CURRENT_DATE, '9:00 AM', 'high'),
(CURRENT_DATE, '10:00 AM', 'medium'),
(CURRENT_DATE, '2:00 PM', 'low'),
(CURRENT_DATE + INTERVAL '1 day', '9:00 AM', 'low'),
(CURRENT_DATE + INTERVAL '1 day', '11:00 AM', 'medium');
```

### Step 4: Verify Setup
1. Go back to your application at http://localhost:5173/
2. You should see the stationery items loaded
3. The demo mode notice should disappear
4. Try adding items to cart and making a booking

## Tables Created

### stationery_items
- `id` (Primary Key)
- `name` (Text)
- `price` (Numeric)
- `created_at` (Timestamp)

### rush_status
- `id` (Primary Key)
- `date` (Date)
- `time_slot` (Text)
- `status` (Text: 'high', 'medium', 'low')
- `created_at` (Timestamp)

### bookings
- `id` (Primary Key)
- `date` (Date)
- `time_slot` (Text)
- `items` (JSONB)
- `total_cost` (Numeric)
- `created_at` (Timestamp)

## Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Public access** for viewing items and creating bookings
- **Authenticated access** required for admin functions
- **Proper policies** for data access control

## Admin Access

To access admin features:
1. Go to http://localhost:5173/admin/login
2. Use your Supabase auth credentials
3. Or set up authentication in your Supabase dashboard

## Troubleshooting

### If you see "Demo Mode" notice:
- Check that your `.env.local` file has correct Supabase credentials
- Restart the development server: `npm run dev`
- Verify credentials in Supabase dashboard

### If tables don't exist:
- Run the migration SQL in Supabase SQL Editor
- Check for any SQL errors in the dashboard
- Verify your project URL and API key

### If authentication doesn't work:
- Enable authentication in Supabase dashboard
- Configure authentication providers if needed
- Check RLS policies are properly set

## Need Help?

1. Check the browser console for any errors
2. Check the Supabase dashboard logs
3. Verify your environment variables
4. Ensure the migration ran successfully
