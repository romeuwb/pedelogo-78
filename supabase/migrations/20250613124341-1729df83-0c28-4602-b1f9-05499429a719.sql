
-- Add API key management for restaurants
ALTER TABLE restaurant_printers ADD COLUMN IF NOT EXISTS api_key TEXT;
ALTER TABLE restaurant_printers ADD COLUMN IF NOT EXISTS api_key_generated_at TIMESTAMP WITH TIME ZONE;

-- Create table for API key history
CREATE TABLE IF NOT EXISTS restaurant_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurant_details(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  revoked_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on the new table
ALTER TABLE restaurant_api_keys ENABLE ROW LEVEL SECURITY;

-- Create policy for restaurant owners to manage their API keys (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'restaurant_api_keys' 
    AND policyname = 'Restaurant owners can manage their API keys'
  ) THEN
    CREATE POLICY "Restaurant owners can manage their API keys" 
      ON restaurant_api_keys 
      FOR ALL 
      USING (
        EXISTS (
          SELECT 1 FROM restaurant_details 
          WHERE id = restaurant_api_keys.restaurant_id 
          AND user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_restaurant_api_key(p_restaurant_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_api_key TEXT;
BEGIN
  -- Check if user owns the restaurant
  IF NOT EXISTS (
    SELECT 1 FROM restaurant_details 
    WHERE id = p_restaurant_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Generate new API key
  new_api_key := 'rapi_' || replace(gen_random_uuid()::text, '-', '');
  
  -- Revoke existing active keys
  UPDATE restaurant_api_keys 
  SET is_active = false, revoked_at = now()
  WHERE restaurant_id = p_restaurant_id AND is_active = true;
  
  -- Insert new API key
  INSERT INTO restaurant_api_keys (restaurant_id, api_key, created_by)
  VALUES (p_restaurant_id, new_api_key, auth.uid());
  
  -- Update restaurant_printers table
  UPDATE restaurant_printers 
  SET api_key = new_api_key, api_key_generated_at = now()
  WHERE restaurant_id = p_restaurant_id;
  
  RETURN new_api_key;
END;
$$;

-- Function to get current API key for restaurant
CREATE OR REPLACE FUNCTION get_restaurant_api_key(p_restaurant_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_key TEXT;
BEGIN
  -- Check if user owns the restaurant
  IF NOT EXISTS (
    SELECT 1 FROM restaurant_details 
    WHERE id = p_restaurant_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Get current active API key
  SELECT api_key INTO current_key
  FROM restaurant_api_keys
  WHERE restaurant_id = p_restaurant_id AND is_active = true
  ORDER BY generated_at DESC
  LIMIT 1;
  
  -- If no key exists, generate one
  IF current_key IS NULL THEN
    current_key := generate_restaurant_api_key(p_restaurant_id);
  END IF;
  
  RETURN current_key;
END;
$$;
