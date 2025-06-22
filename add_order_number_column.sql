-- Complete Supabase Database Setup for Stationery Management System
-- Run this in your Supabase SQL Editor

-- 1. Ensure bookings table exists with all required columns
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  items JSONB NOT NULL,
  total_cost NUMERIC(10,2) NOT NULL,
  order_number TEXT,
  order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'taken', 'not_taken')),
  payment_method TEXT,
  payment_status TEXT,
  payment_id TEXT,
  payment_amount NUMERIC(10,2),
  payment_currency TEXT DEFAULT 'INR',
  payment_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add missing columns if they don't exist
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS order_status TEXT DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_currency TEXT DEFAULT 'INR';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMPTZ;

-- 2.2. Add stock_quantity column to stationery_items if it doesn't exist
ALTER TABLE stationery_items ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;

-- 2.1. Add constraint for order_status if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'bookings_order_status_check'
        AND table_name = 'bookings'
    ) THEN
        ALTER TABLE bookings ADD CONSTRAINT bookings_order_status_check
        CHECK (order_status IN ('pending', 'taken', 'not_taken'));
    END IF;
END $$;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_order_number ON bookings(order_number);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_name ON bookings(customer_name);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- 4. Ensure stationery_items table exists
CREATE TABLE IF NOT EXISTS stationery_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Ensure rush_status table exists
CREATE TABLE IF NOT EXISTS rush_status (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, time_slot)
);

-- 6. Insert sample stationery items if table is empty
INSERT INTO stationery_items (name, price, stock_quantity)
SELECT * FROM (VALUES
  ('Notebook', 25.99, 50),
  ('Pen Set', 15.50, 30),
  ('Highlighters', 12.00, 25),
  ('Sticky Notes', 8.75, 100),
  ('Stapler', 22.00, 15),
  ('Paper Clips', 5.25, 200),
  ('Ruler', 7.50, 40),
  ('Eraser', 3.00, 75)
) AS v(name, price, stock_quantity)
WHERE NOT EXISTS (SELECT 1 FROM stationery_items);

-- 6.1. Update existing items to have stock if they don't have any
UPDATE stationery_items
SET stock_quantity = CASE
  WHEN name = 'Notebook' THEN 50
  WHEN name = 'Pen Set' THEN 30
  WHEN name = 'Highlighters' THEN 25
  WHEN name = 'Sticky Notes' THEN 100
  WHEN name = 'Stapler' THEN 15
  WHEN name = 'Paper Clips' THEN 200
  WHEN name = 'Ruler' THEN 40
  WHEN name = 'Eraser' THEN 75
  ELSE 20
END
WHERE stock_quantity = 0 OR stock_quantity IS NULL;

-- 7. Enable Row Level Security (RLS) if not already enabled
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stationery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rush_status ENABLE ROW LEVEL SECURITY;

-- 8. Create policies for public access (adjust as needed for your security requirements)
DROP POLICY IF EXISTS "Allow public read access to stationery_items" ON stationery_items;
CREATE POLICY "Allow public read access to stationery_items" ON stationery_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access to bookings" ON bookings;
CREATE POLICY "Allow public insert access to bookings" ON bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access to bookings" ON bookings;
CREATE POLICY "Allow public read access to bookings" ON bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public delete access to bookings" ON bookings;
CREATE POLICY "Allow public delete access to bookings" ON bookings FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access to rush_status" ON rush_status;
CREATE POLICY "Allow public read access to rush_status" ON rush_status FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public upsert access to rush_status" ON rush_status;
CREATE POLICY "Allow public upsert access to rush_status" ON rush_status FOR ALL USING (true);

-- 9. Check the final table structure
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name IN ('bookings', 'stationery_items', 'rush_status')
ORDER BY table_name, ordinal_position;

-- 10. Show sample data
SELECT 'Stationery Items:' as info;
SELECT id, name, price, stock_quantity FROM stationery_items ORDER BY name LIMIT 8;

SELECT 'Recent Bookings:' as info;
SELECT
    id,
    customer_name,
    order_number,
    order_status,
    date,
    time_slot,
    total_cost,
    payment_method,
    payment_status,
    created_at
FROM bookings
ORDER BY created_at DESC
LIMIT 5;

SELECT 'Rush Status:' as info;
SELECT date, time_slot, status FROM rush_status ORDER BY date, time_slot LIMIT 5;

-- 11. Create stock management functions
CREATE OR REPLACE FUNCTION reduce_stock(item_id INTEGER, quantity_used INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE stationery_items
    SET stock_quantity = GREATEST(0, stock_quantity - quantity_used)
    WHERE id = item_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Item with id % not found', item_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_stock_availability(item_id INTEGER, quantity_needed INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    SELECT stock_quantity INTO current_stock
    FROM stationery_items
    WHERE id = item_id;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    RETURN current_stock >= quantity_needed;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION restore_stock(item_id INTEGER, quantity_to_restore INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE stationery_items
    SET stock_quantity = stock_quantity + quantity_to_restore
    WHERE id = item_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Item with id % not found', item_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 12. Grant permissions for stock functions
GRANT EXECUTE ON FUNCTION reduce_stock(INTEGER, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_stock_availability(INTEGER, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION restore_stock(INTEGER, INTEGER) TO authenticated, anon;
