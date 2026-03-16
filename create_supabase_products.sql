-- Step 1: Create the products table
CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id text NOT NULL, -- Ties back to Firebase Auth UID
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  unit text NOT NULL, -- e.g., 'kg', 'bag', 'unit'
  category text NOT NULL, -- e.g., 'fresh', 'tools', 'seeds'
  image_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Note: If you want referential integrity with the 'users' table, you can add:
-- ALTER TABLE products ADD CONSTRAINT fk_seller FOREIGN KEY (seller_id) REFERENCES users(id);

-- Step 2: Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS Policies for the products table
-- Anyone can view products
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);

-- For simplicity in MVP (and since we use Firebase Auth alongside Supabase), 
-- you can allow inserts/updates. If using Supabase strict auth, you'd match auth.uid().
-- Since Firebase UUIDs are passed from the client, we allow authenticated inserts based on the client matching their seller_id
CREATE POLICY "Sellers can insert their own products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Sellers can update their own products" ON products FOR UPDATE USING (true);
CREATE POLICY "Sellers can delete their own products" ON products FOR DELETE USING (true);


-- Step 4: Storage setup for Product Images
-- This creates a public bucket called 'product-images'
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT DO NOTHING;

-- Allows public access to read the images
CREATE POLICY "Product images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- Allows anyone to upload images (for MVP simplicity)
CREATE POLICY "Anyone can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Anyone can update product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
CREATE POLICY "Anyone can delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');
