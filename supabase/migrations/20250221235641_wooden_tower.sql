/*
  # Initial Schema Setup

  1. New Tables
    - stationery_items
      - id (serial primary key)
      - name (text)
      - price (numeric)
      - created_at (timestamp)
    - rush_status
      - id (serial primary key)
      - date (date)
      - time_slot (text)
      - status (text)
      - created_at (timestamp)
    - bookings
      - id (serial primary key)
      - date (date)
      - time_slot (text)
      - items (jsonb)
      - total_cost (numeric)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and public access
*/

-- Create stationery_items table
CREATE TABLE IF NOT EXISTS stationery_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rush_status table
CREATE TABLE IF NOT EXISTS rush_status (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('high', 'medium', 'low')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, time_slot)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  items JSONB NOT NULL,
  total_cost NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE stationery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rush_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies for stationery_items
CREATE POLICY "Public can view stationery items"
  ON stationery_items
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Authenticated users can insert stationery items"
  ON stationery_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update stationery items"
  ON stationery_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete stationery items"
  ON stationery_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for rush_status
CREATE POLICY "Public can view rush status"
  ON rush_status
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Authenticated users can insert rush status"
  ON rush_status
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update rush status"
  ON rush_status
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete rush status"
  ON rush_status
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for bookings
CREATE POLICY "Public can insert bookings"
  ON bookings
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE POLICY "Public can view own bookings"
  ON bookings
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Authenticated users can manage all bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);