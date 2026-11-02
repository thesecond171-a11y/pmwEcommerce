import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const supabase = getAdminClient();

    // Support single update or batch updates
    // { updates: [{ id: "...", stock: 45 }] } or { id: "...", stock: 45 }
    if (Array.isArray(body.updates)) {
      const results = [];
      for (const item of body.updates) {
        if (!item.id || item.stock === undefined) continue;
        const { data, error } = await supabase
          .from('products')
          .update({
            stock: Math.max(0, Number(item.stock)),
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id)
          .select('id, title, stock')
          .single();

        if (error) {
          console.error(`Failed to update stock for product ${item.id}:`, error.message);
        } else {
          results.push(data);
        }
      }

      return NextResponse.json({
        success: true,
        message: `${results.length} stok produk berhasil diperbarui di Supabase`,
        data: results,
      });
    }

    if (body.id && body.stock !== undefined) {
      const { data, error } = await supabase
        .from('products')
        .update({
          stock: Math.max(0, Number(body.stock)),
          updated_at: new Date().toISOString(),
        })
        .eq('id', body.id)
        .select('id, title, stock')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: 'Stok produk berhasil diperbarui di Supabase',
        data,
      });
    }

    return NextResponse.json(
      { error: 'Payload tidak valid. Sediakan { id, stock } atau { updates: [...] }' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

