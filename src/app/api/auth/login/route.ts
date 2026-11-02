import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, anonKey);
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // 1. Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Check if admin credentials fallback matches
      if (email.toLowerCase() === 'admin@gmail.com' && password === 'admin123#') {
        return NextResponse.json({
          success: true,
          user: {
            id: 'admin-polsri-01',
            email: 'admin@gmail.com',
            full_name: 'Admin PMW Polsri',
            role: 'admin',
            phone: '081278901234',
            city: 'Palembang',
          },
        });
      }

      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // 2. Fetch profile from public.profiles
    const userId = data.user?.id;
    let profileData: any = null;

    if (userId) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      profileData = profile;
    }

    const role =
      profileData?.role ||
      (email.toLowerCase().includes('admin') ? 'admin' : 'customer');

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: data.user?.email || email,
        full_name: profileData?.full_name || data.user?.user_metadata?.full_name || 'Pengguna Polsri',
        phone: profileData?.phone || data.user?.user_metadata?.phone,
        role,
        city: profileData?.city || 'Palembang',
        address: profileData?.address,
      },
    });
  } catch (err: any) {
    console.error('Login API route error:', err);
    return NextResponse.json(
      { error: err.message || 'Terjadi kesalahan saat masuk' },
      { status: 500 }
    );
  }
}
