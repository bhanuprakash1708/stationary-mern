-- Add order number column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;

-- Create a function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_num TEXT;
    exists_check INTEGER;
BEGIN
    LOOP
        -- Generate order number: ORD + current date (YYMMDD) + 3 random digits
        order_num := 'ORD' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');

        -- Check if this order number already exists
        SELECT COUNT(*) INTO exists_check FROM bookings WHERE order_number = order_num;

        -- If it doesn't exist, we can use it
        IF exists_check = 0 THEN
            EXIT;
        END IF;
    END LOOP;

    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically generate order numbers for new bookings
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_set_order_number ON bookings;
CREATE TRIGGER trigger_set_order_number
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- Update existing records to have order numbers
UPDATE bookings
SET order_number = generate_order_number()
WHERE order_number IS NULL;

-- Make order_number required for new records
ALTER TABLE bookings ALTER COLUMN order_number SET NOT NULL;

-- Add index for better search performance
CREATE INDEX IF NOT EXISTS idx_bookings_order_number ON bookings(order_number);
