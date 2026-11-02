import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { mockCategories, mockProducts } from '@/lib/mock-data';

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // 1. Seed Categories
    const categoriesPayload = mockCategories.map((c) => ({
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      image_url: c.image_url,
      description: c.description,
    }));

    const { data: insertedCats, error: catError } = await supabase
      .from('categories')
      .upsert(categoriesPayload, { onConflict: 'slug' })
      .select();

    if (catError) {
      return NextResponse.json({ error: 'Category seed failed: ' + catError.message }, { status: 500 });
    }

    // Map category slug to real Supabase UUID
    const catMap = new Map((insertedCats || []).map((c: any) => [c.slug, c.id]));

    // 2. Seed Products
    const productsPayload = mockProducts.map((p) => {
      const catId = catMap.get(p.category?.slug || '') || insertedCats?.[0]?.id || null;
      return {
        title: p.title,
        slug: p.slug,
        description: p.description,
        price: p.price,
        stock: p.stock,
        student_name: p.student_name,
        jurusan: p.jurusan,
        nim: p.nim || null,
        category_id: catId,
        images: p.images,
        is_featured: p.is_featured,
        is_active: p.is_active,
        rating: p.rating,
        sold_count: p.sold_count,
      };
    });

    const { data: insertedProds, error: prodError } = await supabase
      .from('products')
      .upsert(productsPayload, { onConflict: 'slug' })
      .select();

    if (prodError) {
      return NextResponse.json({ error: 'Product seed failed: ' + prodError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      categoriesCount: insertedCats?.length ?? 0,
      productsCount: insertedProds?.length ?? 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
