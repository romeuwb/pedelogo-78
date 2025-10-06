-- Schema PedeLogo OTIMIZADO para PostgreSQL local
-- Apenas estruturas essenciais para o funcionamento da aplicação

BEGIN;

-- 1) Remover todas as tabelas existentes se houver
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE;', r.tablename);
  END LOOP;
END$$;

-- 2) Criar apenas o tipo enumerado necessário
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('pending','confirmed','preparing','ready','out_for_delivery','delivered','canceled');
  END IF;
END $$;

-- 3) TABELAS ESSENCIAIS

-- 3.1 Usuários (simulando auth.users do Supabase)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3.2 Perfis (associa users -> perfil com role)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('client','delivery','restaurant','admin')),
  full_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3.3 Restaurantes
CREATE TABLE restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  name text NOT NULL,
  description text,
  rating numeric(3,2) DEFAULT 0,
  delivery_fee numeric(10,2) DEFAULT 0,
  eta_min int,
  eta_max int,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3.4 Categorias (globais)
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE
);

-- 3.5 Produtos
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3.6 Endereços
CREATE TABLE addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label text,
  street text,
  number text,
  complement text,
  district text,
  city text,
  state text,
  zip_code text,
  lat double precision,
  lng double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3.7 Pedidos
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE RESTRICT,
  address_id uuid REFERENCES addresses(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'pending',
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3.8 Itens do pedido
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity int NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL,
  total numeric(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- 4) Índices essenciais (otimizados)
CREATE INDEX idx_products_restaurant ON products(restaurant_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_restaurants_active ON restaurants(is_active);

COMMIT;

-- Comentários sobre a otimização:
-- ✅ REMOVIDO: couriers, deliveries, payments (funcionalidades não implementadas)
-- ✅ REMOVIDO: tipos delivery_status, payment_status (não utilizados)
-- ✅ MANTIDO: Apenas 8 tabelas essenciais para o core da aplicação
-- ✅ OTIMIZADO: Índices apenas onde realmente necessário
-- 🎯 RESULTADO: Banco mais leve e focado no essencial