import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, anonKey);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email verifikasi berhasil dikirim ulang!',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Gagal mengirim ulang email' },
      { status: 500 }
    );
  }
}

