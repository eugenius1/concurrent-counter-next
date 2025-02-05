-- Enable the pgcrypto extension for UUID functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the counters table with ULID stored as text
CREATE TABLE IF NOT EXISTS counters(
  id text PRIMARY KEY,
  value integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable row level security
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read counters
CREATE POLICY "Allow anyone to read counters" ON counters
  FOR SELECT TO public
    USING (TRUE);

-- Create policy to allow anyone to insert counters
CREATE POLICY "Allow anyone to insert counters" ON counters
  FOR INSERT TO public
    WITH CHECK (TRUE);

-- Create function to update counter atomically
CREATE OR REPLACE FUNCTION update_counter(counter_id text, increment_by integer)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
BEGIN
  UPDATE
    counters
  SET
    value = value + increment_by
  WHERE
    id = counter_id;
END;
$$;

-- Create policy to allow anyone to execute the update_counter function
CREATE POLICY "Allow anyone to update counters" ON counters
  FOR UPDATE TO public
    USING (TRUE)
    WITH CHECK (TRUE);

