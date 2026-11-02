import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang diunggah' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop() || 'png';
    const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = `product-media/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, buffer, {
        contentType: file.type || 'image/png',
        upsert: false,
      });

    if (uploadError) {
      console.error('[Admin Upload API] Storage error:', uploadError.message);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage.from('products').getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      message: 'Foto produk berhasil diunggah ke Supabase Storage',
      url: data.publicUrl,
    });
  } catch (error: any) {
    console.error('[Admin Upload API] Exception:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

