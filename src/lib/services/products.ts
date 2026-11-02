import { createClient } from '@/lib/supabase/client';
import { Product } from '@/types';

export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[Supabase] fetchProducts error:', error.message);
    return null;
  }

  return (data || []).map((item) => ({
    id: item.id,
    category_id: item.category_id,
    category: item.category,
    title: item.title,
    slug: item.slug,
    description: item.description,
    price: Number(item.price),
    stock: Number(item.stock),
    student_name: item.student_name,
    jurusan: item.jurusan,
    nim: item.nim,
    images: item.images || [],
    is_featured: Boolean(item.is_featured),
    is_active: Boolean(item.is_active),
    rating: Number(item.rating || 5.0),
    sold_count: Number(item.sold_count || 0),
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));
}

export async function createProductInSupabase(
  product: Omit<Product, 'id' | 'slug' | 'rating' | 'sold_count'>
): Promise<Product | null> {
  const supabase = createClient();
  const slug = product.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

  const payload = {
    title: product.title,
    slug,
    description: product.description,
    price: product.price,
    stock: product.stock,
    student_name: product.student_name,
    jurusan: product.jurusan,
    nim: product.nim || null,
    category_id: product.category_id || null,
    images: product.images || [],
    is_featured: product.is_featured ?? false,
    is_active: product.is_active ?? true,
    rating: 5.0,
    sold_count: 0,
  };

  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select(`
      *,
      category:categories(*)
    `)
    .single();

  if (error) {
    console.error('[Supabase] createProduct error:', error.message);
    return null;
  }

  return {
    ...data,
    price: Number(data.price),
    stock: Number(data.stock),
    rating: Number(data.rating),
    sold_count: Number(data.sold_count),
  };
}

export async function updateProductInSupabase(
  id: string,
  updates: Partial<Product>
): Promise<boolean> {
  const supabase = createClient();
  const payload: any = { ...updates, updated_at: new Date().toISOString() };
  delete payload.category; // Don't send joined object

  const { error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('[Supabase] updateProduct error:', error.message);
    return false;
  }
  return true;
}

export async function deleteProductInSupabase(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Supabase] deleteProduct error:', error.message);
    return false;
  }
  return true;
}

export async function updateProductStockInSupabase(
  id: string,
  newStock: number
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('products')
    .update({ stock: Math.max(0, newStock), updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('[Supabase] updateStock error:', error.message);
    return false;
  }
  return true;
}

/**
 * Upload an image file to Supabase Storage bucket 'products'
 */
export async function uploadProductImageToSupabase(file: File): Promise<string | null> {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop() || 'png';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `product-media/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('products')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('[Supabase Storage] upload error:', uploadError.message);
    return null;
  }

  const { data } = supabase.storage
    .from('products')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

