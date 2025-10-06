-- ==========================================
-- NOVO SCHEMA PARA BANCO LOCAL POSTGRESQL
-- Versão adaptada sem auth.users do Supabase
-- ==========================================

BEGIN;

-- 📋 VERIFICAR ESTRUTURA ATUAL
SELECT 'Estrutura antes de recriar:' as info;
\dt

-- ==========================================
-- 🆕 CRIAR NOVA ESTRUTURA DO ZERO
-- ==========================================

-- 1️⃣ CRIAR TIPOS ENUMERADOS
CREATE TYPE order_status AS ENUM (
    'pending',
    'confirmed', 
    'preparing',
    'ready',
    'out_for_delivery',
    'delivered',
    'canceled'
);

CREATE TYPE user_role AS ENUM (
    'client',
    'restaurant_owner',
    'admin'
);

-- 2️⃣ TABELA USERS (versão local sem auth.users)
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    full_name text,
    phone text,
    password_hash text, -- para desenvolvimento local
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3️⃣ RECRIAR TABELA PROFILES
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'client',
    avatar_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4️⃣ RESTAURANTES
CREATE TABLE restaurants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    image_url text,
    phone text,
    email text,
    address text,
    city text,
    state text,
    zip_code text,
    latitude decimal(10,8),
    longitude decimal(11,8),
    rating decimal(3,2) DEFAULT 0,
    delivery_fee decimal(10,2) DEFAULT 0,
    minimum_order decimal(10,2) DEFAULT 0,
    delivery_time_min integer DEFAULT 30,
    delivery_time_max integer DEFAULT 60,
    is_active boolean NOT NULL DEFAULT true,
    is_open boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5️⃣ CATEGORIAS DE PRODUTOS
CREATE TABLE categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    image_url text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 6️⃣ PRODUTOS
CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
    name text NOT NULL,
    description text,
    image_url text,
    price decimal(10,2) NOT NULL CHECK (price > 0),
    preparation_time integer DEFAULT 15,
    is_available boolean NOT NULL DEFAULT true,
    is_featured boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7️⃣ ENDEREÇOS DE ENTREGA
CREATE TABLE delivery_addresses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label text NOT NULL, -- 'Casa', 'Trabalho', etc
    street text NOT NULL,
    number text NOT NULL,
    complement text,
    neighborhood text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    zip_code text NOT NULL,
    latitude decimal(10,8),
    longitude decimal(11,8),
    is_default boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8️⃣ PEDIDOS
CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE RESTRICT,
    delivery_address_id uuid NOT NULL REFERENCES delivery_addresses(id) ON DELETE RESTRICT,
    status order_status NOT NULL DEFAULT 'pending',
    subtotal decimal(10,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    delivery_fee decimal(10,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
    total decimal(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    notes text,
    estimated_delivery_time timestamptz,
    delivered_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 9️⃣ ITENS DO PEDIDO
CREATE TABLE order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity integer NOT NULL CHECK (quantity > 0),
    unit_price decimal(10,2) NOT NULL CHECK (unit_price > 0),
    total decimal(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- ==========================================
-- 🔧 CRIAR ÍNDICES OTIMIZADOS
-- ==========================================

-- Índices para performance
CREATE INDEX idx_profiles_user ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);

CREATE INDEX idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX idx_restaurants_active ON restaurants(is_active, is_open);
CREATE INDEX idx_restaurants_location ON restaurants(latitude, longitude);

CREATE INDEX idx_products_restaurant ON products(restaurant_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_available ON products(is_available);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

CREATE INDEX idx_delivery_addresses_user ON delivery_addresses(user_id);

COMMIT;

-- ==========================================
-- ✅ VERIFICAR ESTRUTURA CRIADA
-- ==========================================

SELECT 'NOVA ESTRUTURA LOCAL CRIADA:' as info;
\dt

SELECT 'Total de tabelas:' as info, COUNT(*) as quantidade
FROM information_schema.tables 
WHERE table_schema = 'public';

SELECT '🎉 ESTRUTURA NOVA CRIADA COM SUCESSO NO BANCO LOCAL!' as resultado;