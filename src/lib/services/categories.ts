import { createClient } from '@/lib/supabase/client';
import { Category } from '@/types';

export async function fetchCategoriesFromSupabase(): Promise<Category[] | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.warn('[Supabase] fetchCategories error:', error.message);
    return null;
  }

  return data as Category[];
}

export async function createCategoryInSupabase(
  category: Omit<Category, 'id' | 'slug'>
): Promise<Category | null> {
  const supabase = createClient();
  const slug = category.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const payload = {
    name: category.name,
    slug,
    icon: category.icon || 'ShoppingBag',
    image_url: category.image_url || null,
    description: category.description || null,
  };

  const { data, error } = await supabase
    .from('categories')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] createCategory error:', error.message);
    return null;
  }

  return data as Category;
}

export async function updateCategoryInSupabase(
  id: string,
  updates: Partial<Category>
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('[Supabase] updateCategory error:', error.message);
    return false;
  }
  return true;
}

export async function deleteCategoryInSupabase(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Supabase] deleteCategory error:', error.message);
    return false;
  }
  return true;
}

