-- Add customer_name column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- Update the column to be NOT NULL with a default for existing records
UPDATE bookings SET customer_name = 'Anonymous Customer' WHERE customer_name IS NULL;
ALTER TABLE bookings ALTER COLUMN customer_name SET NOT NULL;

-- Add an index for faster customer name searches
CREATE INDEX IF NOT EXISTS idx_bookings_customer_name ON bookings(customer_name);

-- Add an index for faster date searches (useful for admin orders view)
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);

-- Add an index for faster date + time slot searches
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(date, time_slot);
