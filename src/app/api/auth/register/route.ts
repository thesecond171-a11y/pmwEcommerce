import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { email, password, fullName, phone } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan kata sandi wajib diisi' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Kata sandi minimal 6 karakter' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    // 1. Create user with email auto-confirmed via Supabase Admin API
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
      const errLower = error.message.toLowerCase();
      // If already registered in auth.users, check if profile exists
      if (
        errLower.includes('already') ||
        errLower.includes('registered') ||
        errLower.includes('exists') ||
        errLower.includes('duplicate')
      ) {
        // Fetch existing profile
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        // Ensure profile exists in profiles table
        if (!existingProfile) {
          // If profile row missing, try to create it
          await supabaseAdmin.from('profiles').upsert(
            {
              email,
              full_name: fullName || 'Pelanggan Polsri',
              phone: phone || '',
              role: 'customer',
              city: 'Palembang',
            },
            { onConflict: 'email' }
          );
        }

        return NextResponse.json({
          success: true,
          alreadyRegistered: true,
          message: 'Akun Anda sudah terdaftar di Supabase.',
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

    // 2. Ensure profile exists in public.profiles table
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
      { error: err.message || 'Terjadi kesalahan pada pendaftaran server' },
      { status: 500 }
    );
  }
}
