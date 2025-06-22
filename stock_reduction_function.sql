-- Database function to safely reduce stock quantities
-- Run this in your Supabase SQL Editor

-- 1. Create function to reduce stock quantity safely
CREATE OR REPLACE FUNCTION reduce_stock(item_id INTEGER, quantity_used INTEGER)
RETURNS VOID AS $$
BEGIN
    -- Update stock quantity, ensuring it doesn't go below 0
    UPDATE stationery_items 
    SET stock_quantity = GREATEST(0, stock_quantity - quantity_used)
    WHERE id = item_id;
    
    -- Check if the update affected any rows
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Item with id % not found', item_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. Create function to check stock availability
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

-- 3. Create function to get low stock items
CREATE OR REPLACE FUNCTION get_low_stock_items(threshold INTEGER DEFAULT 5)
RETURNS TABLE(id INTEGER, name TEXT, price NUMERIC, stock_quantity INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT si.id, si.name, si.price, si.stock_quantity
    FROM stationery_items si
    WHERE si.stock_quantity <= threshold
    ORDER BY si.stock_quantity ASC, si.name ASC;
END;
$$ LANGUAGE plpgsql;

-- 4. Create function to restore stock (for order cancellations)
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

-- 5. Test the functions (optional)
-- SELECT check_stock_availability(1, 5); -- Check if item 1 has at least 5 in stock
-- SELECT * FROM get_low_stock_items(10); -- Get items with 10 or fewer in stock

-- 6. Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION reduce_stock(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION check_stock_availability(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_low_stock_items(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_stock(INTEGER, INTEGER) TO authenticated;

-- 7. Grant execute permissions to anon users (for public access)
GRANT EXECUTE ON FUNCTION reduce_stock(INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION check_stock_availability(INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_low_stock_items(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION restore_stock(INTEGER, INTEGER) TO anon;

-- 8. Show created functions
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('reduce_stock', 'check_stock_availability', 'get_low_stock_items', 'restore_stock')
ORDER BY routine_name;
