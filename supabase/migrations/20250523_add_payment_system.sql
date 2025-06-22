-- Add payment-related columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('online', 'cash_on_delivery'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed', 'not_required'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_id TEXT; -- Razorpay payment ID
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_currency TEXT DEFAULT 'INR';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMPTZ;

-- Set default values for existing records
UPDATE bookings 
SET 
  payment_method = 'cash_on_delivery',
  payment_status = 'not_required',
  payment_amount = total_cost,
  payment_currency = 'INR'
WHERE payment_method IS NULL;

-- Make payment_method and payment_status required for new records
ALTER TABLE bookings ALTER COLUMN payment_method SET NOT NULL;
ALTER TABLE bookings ALTER COLUMN payment_status SET NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_method ON bookings(payment_method);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_id ON bookings(payment_id);

-- Create a view for payment analytics
CREATE OR REPLACE VIEW payment_analytics AS
SELECT 
  payment_method,
  payment_status,
  COUNT(*) as booking_count,
  SUM(payment_amount) as total_amount,
  AVG(payment_amount) as average_amount,
  DATE(created_at) as booking_date
FROM bookings 
GROUP BY payment_method, payment_status, DATE(created_at)
ORDER BY booking_date DESC;
