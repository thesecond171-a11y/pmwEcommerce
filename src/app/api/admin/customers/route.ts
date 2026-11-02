import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getAdminClient();

    // 1. Fetch profiles
    const { data: profiles, error: profsError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profsError) {
      return NextResponse.json({ error: profsError.message }, { status: 400 });
    }

    // 2. Fetch orders to calculate stats per customer
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, user_id, customer_email, customer_name, customer_phone, shipping_city, total_amount, payment_status, created_at');

    if (ordersError) {
      console.warn('[Admin Customers API] Failed to fetch orders for customer stats:', ordersError.message);
    }

    const safeOrders = orders || [];

    // Map profiles and merge stats
    const customerStats = (profiles || []).map((prof) => {
      const userOrders = safeOrders.filter(
        (o) =>
          (o.user_id && o.user_id === prof.id) ||
          (o.customer_email && o.customer_email.toLowerCase() === prof.email?.toLowerCase())
      );

      const paidOrders = userOrders.filter((o) => o.payment_status === 'paid');
      const totalSpent = paidOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

      const sorted = [...userOrders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const lastOrderDate = sorted[0]?.created_at || null;

      return {
        id: prof.id,
        email: prof.email,
        full_name: prof.full_name || 'Pelanggan Polsri',
        phone: prof.phone || '-',
        city: prof.city || 'Palembang',
        role: prof.role,
        address: prof.address,
        created_at: prof.created_at,
        orders_count: userOrders.length,
        total_spent: totalSpent,
        last_order_date: lastOrderDate,
      };
    });

    return NextResponse.json({
      success: true,
      source: 'Supabase Database',
      data: customerStats,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

