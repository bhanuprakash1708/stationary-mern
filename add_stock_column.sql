-- Add stock_quantity column to stationery_items table
-- Run this in your Supabase SQL Editor

-- 1. Add the stock_quantity column if it doesn't exist
ALTER TABLE stationery_items ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;

-- 2. Update existing items to have stock quantities
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

-- 3. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_stationery_items_stock ON stationery_items(stock_quantity);

-- 4. Check the updated table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'stationery_items' 
ORDER BY ordinal_position;

-- 5. Show items with their stock quantities
SELECT id, name, price, stock_quantity
FROM stationery_items 
ORDER BY name;

-- 6. Show stock status summary
SELECT 
  CASE 
    WHEN stock_quantity = 0 THEN 'Out of Stock'
    WHEN stock_quantity <= 5 THEN 'Low Stock'
    ELSE 'In Stock'
  END as stock_status,
  COUNT(*) as item_count
FROM stationery_items 
GROUP BY 
  CASE 
    WHEN stock_quantity = 0 THEN 'Out of Stock'
    WHEN stock_quantity <= 5 THEN 'Low Stock'
    ELSE 'In Stock'
  END
ORDER BY item_count DESC;
