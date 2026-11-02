import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({
      configured: false,
      message: 'Supabase credentials missing in .env.local',
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const [productsRes, categoriesRes, ordersRes] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
    ]);

    const isProductsReady = !productsRes.error && productsRes.status !== 404;
    const isCategoriesReady = !categoriesRes.error && categoriesRes.status !== 404;
    const isOrdersReady = !ordersRes.error && ordersRes.status !== 404;

    const allTablesReady = isProductsReady && isCategoriesReady && isOrdersReady;

    return NextResponse.json({
      configured: true,
      projectUrl: supabaseUrl,
      allTablesReady,
      tables: {
        products: { ready: isProductsReady, count: productsRes.count ?? 0, error: productsRes.error?.message },
        categories: { ready: isCategoriesReady, count: categoriesRes.count ?? 0, error: categoriesRes.error?.message },
        orders: { ready: isOrdersReady, count: ordersRes.count ?? 0, error: ordersRes.error?.message },
      },
      sqlEditorUrl: `https://supabase.com/dashboard/project/vguhuwlrjkncgetignqd/sql/new`,
    });
  } catch (err: any) {
    return NextResponse.json({
      configured: true,
      error: err.message,
    }, { status: 500 });
  }
}

