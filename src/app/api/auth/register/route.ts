import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { email, password, fullName, phone } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // 1. Create user with email auto-confirmed via admin API
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || 'Pelanggan Polsri',
        phone: phone || '',
        role: 'customer',
      },
    });

    if (error) {
      // If already registered in auth.users, fetch their profile and succeed
      if (
        error.message.toLowerCase().includes('already') ||
        error.message.toLowerCase().includes('registered') ||
        error.message.toLowerCase().includes('exists')
      ) {
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();

        return NextResponse.json({
          success: true,
          alreadyRegistered: true,
          message: 'Akun Anda sudah terdaftar di Supabase. Berhasil masuk!',
          user: existingProfile || {
            email,
            full_name: fullName || 'Pelanggan Polsri',
            phone,
            role: 'customer',
          },
        });
      }

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 2. Ensure profile exists in public.profiles
    const userId = data.user?.id;
    if (userId) {
      await supabaseAdmin.from('profiles').upsert(
        {
          id: userId,
          email,
          full_name: fullName || 'Pelanggan Polsri',
          phone: phone || '',
          role: 'customer',
          city: 'Palembang',
        },
        { onConflict: 'id' }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        full_name: fullName || 'Pelanggan Polsri',
        phone: phone || '',
        role: 'customer',
        city: 'Palembang',
      },
    });
  } catch (err: any) {
    console.error('Register API route error:', err);
    return NextResponse.json(
      { error: err.message || 'Terjadi kesalahan pada pendaftaran' },
      { status: 500 }
    );
  }
}
