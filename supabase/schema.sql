-- ========================================================
-- DATABASE SCHEMA: PMW POLITEKNIK NEGERI SRIWIJAYA STORE
-- ========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending_payment', 'paid', 'processing', 'shipped', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'expired', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role DEFAULT 'customer',
    avatar_url TEXT,
    address TEXT,
    city TEXT DEFAULT 'Palembang',
    postal_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUCTS TABLE (Produk Mahasiswa PMW Polsri)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    student_name TEXT NOT NULL,
    jurusan TEXT NOT NULL,
    nim TEXT,
    images TEXT[] NOT NULL DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    sold_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_postal_code TEXT,
    shipping_method TEXT NOT NULL,
    shipping_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL,
    status order_status DEFAULT 'pending_payment',
    payment_status payment_status DEFAULT 'unpaid',
    payment_method TEXT,
    snap_token TEXT,
    snap_redirect_url TEXT,
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_title TEXT NOT NULL,
    product_image TEXT,
    price NUMERIC(12, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);

-- ========================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ========================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER tr_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Function to handle new user registration in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, phone, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Pengguna Polsri'),
        NEW.raw_user_meta_data->>'phone',
        CASE 
            WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::public.user_role
            ELSE 'customer'::public.user_role
        END
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Categories Policies
CREATE POLICY "Categories viewable by everyone" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage categories" ON public.categories
    FOR ALL USING (public.is_admin());

-- 3. Products Policies
CREATE POLICY "Active products viewable by everyone" ON public.products
    FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admin can insert products" ON public.products
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update products" ON public.products
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin can delete products" ON public.products
    FOR DELETE USING (public.is_admin());

-- 4. Orders Policies
CREATE POLICY "Customers can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Customers can create orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR public.is_admin());

CREATE POLICY "Admin can update any order" ON public.orders
    FOR UPDATE USING (public.is_admin() OR auth.uid() = user_id);

-- 5. Order Items Policies
CREATE POLICY "Customers can view own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (orders.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Customers or system can create order items" ON public.order_items
    FOR INSERT WITH CHECK (true);

-- 6. Cart Items Policies
CREATE POLICY "Users can view own cart items" ON public.cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON public.cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON public.cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON public.cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================================
-- STORAGE BUCKETS & POLICIES (Product Images & Media)
-- ========================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
    CREATE POLICY "Public can view product images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'products');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated users and admin can upload product images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'products');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated users and admin can update product images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'products');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated users and admin can delete product images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'products');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ========================================================
-- SEED DATA (Kategori & Produk PMW Polsri)
-- ========================================================

-- Categories
INSERT INTO public.categories (id, name, slug, icon, description, image_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Kuliner & Minuman', 'kuliner-minuman', 'UtensilsCrossed', 'Makanan khas Palembang, camilan kekinian, dan minuman segar karya mahasiswa', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'),
('22222222-2222-2222-2222-222222222222', 'Fashion & Kriya Kampus', 'fashion-kriya', 'Shirt', 'Baju jurusan, batik & songket modern, tote bag, merchandise resmi Polsri', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=80'),
('33333333-3333-3333-3333-333333333333', 'Teknologi & Kreatif', 'teknologi-kreatif', 'Laptop', 'Aksesoris gadget, cetak 3D, IoT kit, dan layanan digital mahasiswa teknik Polsri', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&auto=format&fit=crop&q=80'),
('44444444-4444-4444-4444-444444444444', 'Karya Seni & Souvenir', 'karya-seni-souvenir', 'Palette', 'Gantungan kunci akrilik, plakat wisuda, hiasan dinding, souvenir Sriwijaya', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80'),
('55555555-5555-5555-5555-555555555555', 'Pertanian & Agribisnis', 'pertanian-agribisnis', 'Sprout', 'Tanaman hias hidroponik, pupuk organik cair, bibit herbal inovasi kampus', 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=500&auto=format&fit=crop&q=80')
ON CONFLICT (slug) DO NOTHING;

-- ========================================================
-- DEFAULT ADMIN ACCOUNT: admin@gmail.com / admin123#
-- ========================================================
DO $$
DECLARE
    admin_uid UUID := gen_random_uuid();
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@gmail.com') THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            admin_uid,
            'authenticated',
            'authenticated',
            'admin@gmail.com',
            crypt('admin123#', gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Admin PMW Polsri","role":"admin","phone":"081278901234"}',
            NOW(),
            NOW(),
            '',
            ''
        );

        INSERT INTO public.profiles (id, email, full_name, phone, role, address, city)
        VALUES (
            admin_uid,
            'admin@gmail.com',
            'Admin PMW Polsri',
            '081278901234',
            'admin'::public.user_role,
            'Gedung Kantor Pusat Administrasi Polsri, Jl. Srijaya Negara, Bukit Besar',
            'Palembang'
        )
        ON CONFLICT (id) DO UPDATE SET 
            role = 'admin'::public.user_role,
            full_name = 'Admin PMW Polsri';
    ELSE
        UPDATE auth.users
        SET encrypted_password = crypt('admin123#', gen_salt('bf')),
            email_confirmed_at = NOW(),
            raw_user_meta_data = '{"full_name":"Admin PMW Polsri","role":"admin","phone":"081278901234"}'
        WHERE email = 'admin@gmail.com';

        UPDATE public.profiles
        SET role = 'admin'::public.user_role,
            full_name = 'Admin PMW Polsri'
        WHERE email = 'admin@gmail.com';
    END IF;
END $$;

-- Products
INSERT INTO public.products (title, slug, description, price, stock, student_name, jurusan, nim, category_id, images, is_featured, is_active, rating, sold_count) VALUES
(
    'Pempek Crispy Tenggiri Frozen Pack (Isi 15 pcs)',
    'pempek-crispy-tenggiri-frozen-pack',
    'Pempek crispy renyah di luar lembut di dalam dibuat dari 100% ikan tenggiri segar dengan cuko pedas manis khas Palembang. Dilengkapi kemasan vacuum tahan hingga 2 bulan di freezer. Produk inovasi PMW Polsri.',
    45000,
    85,
    'M. Rizky Pratama',
    'D4 Teknik Kimia',
    '062140411234',
    '11111111-1111-1111-1111-111111111111',
    ARRAY['https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80'],
    true,
    true,
    4.9,
    142
),
(
    'Polsri Engineering Navy Hoodie (Official PMW Edition)',
    'polsri-engineering-navy-hoodie',
    'Hoodie eksklusif berbahan Cotton Fleece tebal gramasi 300gsm berlogo Polsri bordir premium di dada. Sangat hangat untuk ruang kelas ber-AC dan modis dipakai harian.',
    165000,
    30,
    'Siti Aisyah & Tim',
    'D3 Teknik Mesin',
    '062230101890',
    '22222222-2222-2222-2222-222222222222',
    ARRAY['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80'],
    true,
    true,
    5.0,
    78
),
(
    'Sriwijaya Smart IoT Plant Monitor Kit',
    'sriwijaya-smart-iot-plant-monitor-kit',
    'Modul monitoring kelembapan tanah, suhu dan cahaya berbasis ESP32 dengan aplikasi Android karya mahasiswa Teknik Komputer Polsri. Cocok untuk praktikum, hobi agrikultur pintar, atau tugas akhir.',
    135000,
    25,
    'Dimas Aditya Rahman',
    'D4 Teknik Informatika',
    '062140832045',
    '33333333-3333-3333-3333-333333333333',
    ARRAY['https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'],
    true,
    true,
    4.8,
    36
),
(
    'Kemplang Panggang Ikan Gabus Asli Kemasan Box (250g)',
    'kemplang-panggang-ikan-gabus-asli',
    'Kemplang panggang tanpa minyak terbuat dari ikan gabus pilihan Sungai Musi. Disajikan dengan sambal terasi manis pedas khas Bukit Besar. Gurih dan sehat!',
    30000,
    120,
    'Nanda Faradila',
    'D3 Administrasi Bisnis',
    '062230202111',
    '11111111-1111-1111-1111-111111111111',
    ARRAY['https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80'],
    false,
    true,
    4.9,
    95
),
(
    'Plakat Akrilik Custom Wisuda Polsri LED Base',
    'plakat-akrilik-custom-wisuda-polsri-led-base',
    'Plakat akrilik laser cutting grafir foto dan ucapan wisuda mahasiswa Polsri dengan dudukan kayu berlampu LED warm white. Hadiah terbaik untuk teman atau kerabat wisudawan.',
    75000,
    40,
    'Bagus Saputra',
    'D4 Desain Grafis / Elektro',
    '062140321980',
    '44444444-4444-4444-4444-444444444444',
    ARRAY['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80'],
    true,
    true,
    4.9,
    54
),
(
    'Pupuk Organik Cair "Sriwijaya BioGrow" 1 Liter',
    'pupuk-organik-cair-sriwijaya-biogrow-1l',
    'Formula pupuk hayati cair ramah lingkungan hasil riset bioteknologi mahasiswa Polsri, mempercepat pertumbuhan tanaman cabai, sayuran hidroponik, dan buah-buahan.',
    28000,
    60,
    'Ahmad Fauzan',
    'D4 Teknik Kimia Industri',
    '062140422501',
    '55555555-5555-5555-5555-555555555555',
    ARRAY['https://images.unsplash.com/photo-1585336261026-7f42d2a2a628?w=600&auto=format&fit=crop&q=80'],
    false,
    true,
    4.7,
    43
),
(
    'Tote Bag Kanvas Motif Songket Palembang Modern',
    'tote-bag-kanvas-motif-songket-palembang-modern',
    'Tote bag kanvas tebal dengan perpaduan ornamen motif songket Palembang bernuansa biru modern. Dilengkapi ritsleting dan kantong furing di dalam.',
    55000,
    50,
    'Indah Permata Sari',
    'D3 Akuntansi',
    '062230501222',
    '22222222-2222-2222-2222-222222222222',
    ARRAY['https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80'],
    true,
    true,
    4.8,
    67
),
(
    'Kopi Robusta Semendo Specialty Roast Beans (200g)',
    'kopi-robusta-semendo-specialty-roast-beans',
    'Biji kopi robusta pilihan dari dataran tinggi Semendo Sumatera Selatan yang disangrai dengan profil medium-dark oleh tim barista mahasiswa Polsri. Aroma cokelat dan karamel.',
    38000,
    90,
    'Fajar Kurniawan',
    'D4 Manajemen Informatika',
    '062140821034',
    '11111111-1111-1111-1111-111111111111',
    ARRAY['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80'],
    false,
    true,
    5.0,
    110
)
ON CONFLICT (slug) DO NOTHING;

-- ========================================================
-- DEFAULT ADMIN ACCOUNT: admin@gmail.com / admin123#
-- ========================================================
DO $$
DECLARE
    admin_uid UUID := gen_random_uuid();
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@gmail.com') THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            admin_uid,
            'authenticated',
            'authenticated',
            'admin@gmail.com',
            crypt('admin123#', gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Admin PMW Polsri","role":"admin","phone":"081278901234"}',
            NOW(),
            NOW(),
            '',
            ''
        );

        INSERT INTO public.profiles (id, email, full_name, phone, role, address, city)
        VALUES (
            admin_uid,
            'admin@gmail.com',
            'Admin PMW Polsri',
            '081278901234',
            'admin'::public.user_role,
            'Gedung Kantor Pusat Administrasi Polsri, Jl. Srijaya Negara, Bukit Besar',
            'Palembang'
        )
        ON CONFLICT (id) DO UPDATE SET 
            role = 'admin'::public.user_role,
            full_name = 'Admin PMW Polsri';
    ELSE
        UPDATE auth.users
        SET encrypted_password = crypt('admin123#', gen_salt('bf')),
            email_confirmed_at = NOW(),
            raw_user_meta_data = '{"full_name":"Admin PMW Polsri","role":"admin","phone":"081278901234"}'
        WHERE email = 'admin@gmail.com';

        UPDATE public.profiles
        SET role = 'admin'::public.user_role,
            full_name = 'Admin PMW Polsri'
        WHERE email = 'admin@gmail.com';
    END IF;
END $$;

