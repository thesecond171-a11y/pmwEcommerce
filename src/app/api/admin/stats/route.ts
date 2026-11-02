import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getAdminClient();

    // 1. Fetch orders
    const { data: orders, error: ordersErr } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false });

    if (ordersErr) {
      console.error('[Admin Stats API] Error fetching orders:', ordersErr.message);
    }

    // 2. Fetch products
    const { data: products, error: prodsErr } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false });

    if (prodsErr) {
      console.error('[Admin Stats API] Error fetching products:', prodsErr.message);
    }

    // 3. Fetch categories
    const { data: categories, error: catsErr } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    // 4. Fetch customers / profiles
    const { data: profiles, error: profsErr } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    const safeOrders = orders || [];
    const safeProducts = products || [];
    const safeCategories = categories || [];
    const safeProfiles = profiles || [];

    // Calculate metrics
    const paidOrders = safeOrders.filter((o) => o.payment_status === 'paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const paidOrdersCount = paidOrders.length;
    const pendingPaymentCount = safeOrders.filter((o) => o.status === 'pending_payment').length;
    const processingCount = safeOrders.filter((o) => o.status === 'processing').length;
    const shippedCount = safeOrders.filter((o) => o.status === 'shipped').length;
    const completedCount = safeOrders.filter((o) => o.status === 'completed').length;
    const cancelledCount = safeOrders.filter((o) => o.status === 'cancelled').length;

    const lowStockProducts = safeProducts.filter((p) => Number(p.stock) <= 30);
    const activeProductsCount = safeProducts.filter((p) => p.is_active).length;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      source: 'Supabase Production Database (Pure Live)',
      stats: {
        totalRevenue,
        totalOrdersCount: safeOrders.length,
        paidOrdersCount,
        pendingPaymentCount,
        processingCount,
        shippedCount,
        completedCount,
        cancelledCount,
        totalProductsCount: safeProducts.length,
        activeProductsCount,
        lowStockCount: lowStockProducts.length,
        totalCategoriesCount: safeCategories.length,
        totalCustomersCount: safeProfiles.length,
      },
      recentOrders: safeOrders.slice(0, 5),
      lowStockProducts: lowStockProducts.slice(0, 6),
      allOrdersCount: safeOrders.length,
    });
  } catch (error: any) {
    console.error('[Admin Stats API] Exception:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

