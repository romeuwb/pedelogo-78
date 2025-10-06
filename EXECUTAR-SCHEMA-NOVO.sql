-- ==========================================
-- EXECUTAR NO NOVO PROJETO SUPABASE
-- URL: https://jvptoycksznyamrhzrwz.supabase.co
-- SQL Editor > New Query > Colar este código
-- ==========================================

-- Verificar projeto atual
SELECT 'Executando schema no NOVO projeto Supabase' as info;

-- ==========================================
-- PEDELOGO - SCHEMA COMPLETO PARA SUPABASE
-- Versão: 2.0 - Otimizada e Limpa
-- ==========================================

BEGIN;

-- ==========================================
-- 1. CRIAR TIPOS ENUMERADOS
-- ==========================================

-- Status dos pedidos
CREATE TYPE order_status AS ENUM (
    'pending',           -- Aguardando confirmação
    'confirmed',         -- Confirmado pelo restaurante
    'preparing',         -- Em preparação
    'ready',            -- Pronto para entrega
    'out_for_delivery', -- Saiu para entrega
    'delivered',        -- Entregue
    'canceled'          -- Cancelado
);

-- Tipos de usuário
CREATE TYPE user_role AS ENUM (
    'client',           -- Cliente
    'restaurant_owner', -- Dono de restaurante
    'admin'            -- Administrador
);

-- ==========================================
-- 2. TABELAS PRINCIPAIS
-- ==========================================

-- 2.1 Usuários (conecta com auth.users do Supabase)
CREATE TABLE users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    full_name text,
    phone text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2.2 Perfis dos usuários
CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'client',
    avatar_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2.3 Restaurantes
CREATE TABLE restaurants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    image_url text,
    phone text,
    email text,
    
    -- Endereço completo
    address text,
    city text,
    state text,
    zip_code text,
    latitude decimal(10,8),
    longitude decimal(11,8),
    
    -- Configurações de negócio
    rating decimal(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    delivery_fee decimal(10,2) DEFAULT 0 CHECK (delivery_fee >= 0),
    minimum_order decimal(10,2) DEFAULT 0 CHECK (minimum_order >= 0),
    delivery_time_min integer DEFAULT 30 CHECK (delivery_time_min > 0),
    delivery_time_max integer DEFAULT 60 CHECK (delivery_time_max > delivery_time_min),
    
    -- Status
    is_active boolean NOT NULL DEFAULT true,
    is_open boolean NOT NULL DEFAULT true,
    
    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2.4 Categorias de produtos
CREATE TABLE categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    image_url text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 2.5 Produtos
CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Informações básicas
    name text NOT NULL,
    description text,
    image_url text,
    price decimal(10,2) NOT NULL CHECK (price > 0),
    
    -- Configurações
    preparation_time integer DEFAULT 15 CHECK (preparation_time > 0),
    is_available boolean NOT NULL DEFAULT true,
    is_featured boolean NOT NULL DEFAULT false,
    
    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2.6 Endereços de entrega
CREATE TABLE delivery_addresses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Identificação
    label text NOT NULL, -- 'Casa', 'Trabalho', 'Outros'
    
    -- Endereço completo
    street text NOT NULL,
    number text NOT NULL,
    complement text,
    neighborhood text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    zip_code text NOT NULL,
    
    -- Coordenadas para cálculo de entrega
    latitude decimal(10,8),
    longitude decimal(11,8),
    
    -- Configurações
    is_default boolean NOT NULL DEFAULT false,
    
    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2.7 Pedidos
CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE RESTRICT,
    delivery_address_id uuid NOT NULL REFERENCES delivery_addresses(id) ON DELETE RESTRICT,
    
    -- Status e valores
    status order_status NOT NULL DEFAULT 'pending',
    subtotal decimal(10,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    delivery_fee decimal(10,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
    total decimal(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    
    -- Informações adicionais
    notes text,
    estimated_delivery_time timestamptz,
    delivered_at timestamptz,
    
    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2.8 Itens do pedido
CREATE TABLE order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    
    -- Quantidade e preços
    quantity integer NOT NULL CHECK (quantity > 0),
    unit_price decimal(10,2) NOT NULL CHECK (unit_price > 0),
    total decimal(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    
    -- Observações do item
    notes text,
    
    -- Timestamp
    created_at timestamptz NOT NULL DEFAULT now()
);

-- ==========================================
-- 3. ÍNDICES PARA PERFORMANCE
-- ==========================================

-- Usuários e perfis
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_profiles_user ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Restaurantes
CREATE INDEX idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX idx_restaurants_active ON restaurants(is_active, is_open);
CREATE INDEX idx_restaurants_city ON restaurants(city);
CREATE INDEX idx_restaurants_location ON restaurants(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Produtos
CREATE INDEX idx_products_restaurant ON products(restaurant_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_available ON products(is_available);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;

-- Endereços
CREATE INDEX idx_delivery_addresses_user ON delivery_addresses(user_id);
CREATE INDEX idx_delivery_addresses_default ON delivery_addresses(user_id, is_default) 
WHERE is_default = true;

-- Pedidos
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_orders_restaurant_status ON orders(restaurant_id, status);

-- Itens do pedido
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ==========================================
-- 4. FUNÇÕES ÚTEIS
-- ==========================================

-- Função para atualizar timestamp automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger de atualização nas tabelas
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at 
    BEFORE UPDATE ON restaurants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_addresses_updated_at 
    BEFORE UPDATE ON delivery_addresses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
CREATE POLICY "Users can view own data" ON users 
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own profile" ON profiles 
    FOR ALL USING (auth.uid() = id);

-- Políticas para restaurantes
CREATE POLICY "Restaurant owners can manage own restaurants" ON restaurants 
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Everyone can view active restaurants" ON restaurants 
    FOR SELECT USING (is_active = true);

-- Políticas para categorias (públicas)
CREATE POLICY "Everyone can view active categories" ON categories 
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON categories 
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Políticas para produtos
CREATE POLICY "Restaurant owners can manage own products" ON products 
    FOR ALL USING (
        auth.uid() IN (
            SELECT owner_id FROM restaurants WHERE id = restaurant_id
        )
    );

CREATE POLICY "Everyone can view available products" ON products 
    FOR SELECT USING (is_available = true);

-- Políticas para endereços de entrega
CREATE POLICY "Users can manage own addresses" ON delivery_addresses 
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para pedidos
CREATE POLICY "Customers can manage own orders" ON orders 
    FOR ALL USING (auth.uid() = customer_id);

CREATE POLICY "Restaurant owners can view own restaurant orders" ON orders 
    FOR SELECT USING (
        auth.uid() IN (
            SELECT owner_id FROM restaurants WHERE id = restaurant_id
        )
    );

CREATE POLICY "Restaurant owners can update own restaurant orders status" ON orders 
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT owner_id FROM restaurants WHERE id = restaurant_id
        )
    );

-- Políticas para itens do pedido
CREATE POLICY "Users can view order items from own orders" ON order_items 
    FOR SELECT USING (
        auth.uid() IN (
            SELECT customer_id FROM orders WHERE id = order_id
        ) OR auth.uid() IN (
            SELECT r.owner_id FROM orders o 
            JOIN restaurants r ON o.restaurant_id = r.id 
            WHERE o.id = order_id
        )
    );

-- ==========================================
-- 6. DADOS INICIAIS
-- ==========================================

-- Inserir categorias padrão
INSERT INTO categories (name, slug, description, is_active) VALUES
('Lanches', 'lanches', 'Hambúrgueres, sanduíches e afins', true),
('Pizza', 'pizza', 'Pizzas tradicionais e especiais', true),
('Japonês', 'japones', 'Sushi, sashimi e pratos japoneses', true),
('Italiana', 'italiana', 'Massas, risotos e pratos italianos', true),
('Brasileira', 'brasileira', 'Pratos típicos brasileiros', true),
('Bebidas', 'bebidas', 'Refrigerantes, sucos e bebidas', true),
('Sobremesas', 'sobremesas', 'Doces e sobremesas', true),
('Saudável', 'saudavel', 'Opções fitness e saudáveis', true);

COMMIT;

-- ==========================================
-- 7. VERIFICAÇÃO FINAL
-- ==========================================

-- Verificar estrutura criada
SELECT '🎉 Estrutura do PedeLogo criada com SUCESSO no novo projeto!' as status;

SELECT 
    '📊 ' || table_name as tabela_criada,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = t.table_name AND table_schema = 'public') as colunas
FROM information_schema.tables t 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

SELECT '✅ NOVO PROJETO PRONTO PARA USO!' as resultado;