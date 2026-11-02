import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const formatted = (data || []).map((row) => ({
      id: row.id,
      order_number: row.order_number,
      user_id: row.user_id,
      customer_name: row.customer_name,
      customer_email: row.customer_email,
      customer_phone: row.customer_phone,
      shipping_address: row.shipping_address,
      shipping_city: row.shipping_city,
      shipping_postal_code: row.shipping_postal_code,
      shipping_method: row.shipping_method,
      shipping_fee: Number(row.shipping_fee || 0),
      total_amount: Number(row.total_amount),
      status: row.status,
      payment_status: row.payment_status,
      payment_method: row.payment_method,
      snap_token: row.snap_token,
      snap_redirect_url: row.snap_redirect_url,
      tracking_number: row.tracking_number,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      items: (row.items || []).map((i: any) => ({
        id: i.id,
        order_id: i.order_id,
        product_id: i.product_id,
        product_title: i.product_title,
        product_image: i.product_image,
        price: Number(i.price),
        quantity: Number(i.quantity),
        subtotal: Number(i.subtotal),
      })),
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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, tracking_number, payment_status, payment_method } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID pesanan wajib diisi' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) updates.status = status;
    if (tracking_number !== undefined) updates.tracking_number = tracking_number;
    if (payment_status !== undefined) updates.payment_status = payment_status;
    if (payment_method !== undefined) updates.payment_method = payment_method;

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select('*, items:order_items(*)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Status pesanan berhasil diperbarui di Supabase',
      data,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

