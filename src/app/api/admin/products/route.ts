import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const formatted = (data || []).map((item) => ({
      ...item,
      price: Number(item.price),
      stock: Number(item.stock),
      rating: Number(item.rating || 5.0),
      sold_count: Number(item.sold_count || 0),
    }));

    return NextResponse.json({
      success: true,
      source: 'Supabase Database',
      data: formatted,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      category_id,
      description,
      price,
      stock,
      student_name,
      jurusan,
      nim,
      images,
      is_featured,
      is_active,
    } = body;

    if (!title || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: 'Judul produk, harga, dan stok wajib diisi' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

    const payload = {
      title,
      slug,
      category_id: category_id || null,
      description: description || '',
      price: Number(price),
      stock: Number(stock),
      student_name: student_name || 'Mahasiswa Polsri',
      jurusan: jurusan || 'Politeknik Negeri Sriwijaya',
      nim: nim || null,
      images: Array.isArray(images) && images.length > 0 ? images : [],
      is_featured: Boolean(is_featured),
      is_active: is_active !== undefined ? Boolean(is_active) : true,
      rating: 5.0,
      sold_count: 0,
    };

    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select('*, category:categories(*)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil ditambahkan ke Supabase',
      data,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID produk wajib diisi' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Prepare update payload
    const payload: Record<string, any> = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (payload.price !== undefined) payload.price = Number(payload.price);
    if (payload.stock !== undefined) payload.stock = Number(payload.stock);

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil diperbarui di Supabase',
      data,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Parameter id wajib ada' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil dihapus dari Supabase',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

