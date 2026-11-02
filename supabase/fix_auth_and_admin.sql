-- ========================================================
-- PERBAIKAN TRIGGER AUTH SUPABASE & PEMBUATAN AKUN ADMIN
-- Project: PMW POLITEKNIK NEGERI SRIWIJAYA STORE
-- ========================================================

-- 1. PERBAIKI FUNGSI TRIGGER REGISTRASI USER (HANDLE_NEW_USER)
-- Menambahkan 'SET search_path = public' dan blok 'EXCEPTION'
-- agar proses registrasi pelanggan tidak pernah gagal (error 500)
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
    -- Mencegah transaksi pendaftaran auth.users gagal jika terjadi isu profil
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Pastikan trigger terpasang pada auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ========================================================
-- 2. BUAT / UPDATE AKUN ADMIN PMW POLSRI
-- Email: admin@gmail.com
-- Password: admin123#
-- ========================================================

DO $$
DECLARE
    admin_uid UUID := gen_random_uuid();
BEGIN
    -- Jika user belum ada di auth.users, buat user baru
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
        -- Jika user sudah pernah terdaftar, perbarui password dan role-nya menjadi admin
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

