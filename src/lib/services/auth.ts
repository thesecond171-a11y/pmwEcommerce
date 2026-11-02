import { createClient } from '@/lib/supabase/client';
import { UserProfile, UserRole } from '@/types';

export async function signUpWithSupabase(
  email: string,
  password: string,
  fullName: string,
  phone?: string,
  role: UserRole = 'customer'
): Promise<{ user: UserProfile | null; error: string | null }> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone || '',
        role: role,
      },
    },
  });

  if (error) {
    return { user: null, error: error.message };
  }

  if (!data.user) {
    return { user: null, error: 'Pendaftaran gagal' };
  }

  const profile: UserProfile = {
    id: data.user.id,
    email: data.user.email || email,
    full_name: fullName,
    phone: phone,
    role: role,
    city: 'Palembang',
  };

  return { user: profile, error: null };
}

export async function signInWithSupabase(
  email: string,
  password: string
): Promise<{ user: UserProfile | null; error: string | null }> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  if (!data.user) {
    return { user: null, error: 'Login gagal' };
  }

  // Fetch user profile from public.profiles
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  const role: UserRole =
    profileData?.role || (data.user.user_metadata?.role as UserRole) || 'customer';

  const profile: UserProfile = {
    id: data.user.id,
    email: data.user.email || email,
    full_name: profileData?.full_name || data.user.user_metadata?.full_name || 'Pengguna Polsri',
    phone: profileData?.phone || data.user.user_metadata?.phone,
    role,
    avatar_url: profileData?.avatar_url,
    address: profileData?.address,
    city: profileData?.city || 'Palembang',
    postal_code: profileData?.postal_code,
    created_at: profileData?.created_at,
  };

  return { user: profile, error: null };
}

export async function signOutFromSupabase(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function fetchCustomerProfilesFromSupabase(): Promise<UserProfile[] | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[Supabase] fetchCustomerProfiles error:', error.message);
    return null;
  }

  return (data || []).map((p: any) => ({
    id: p.id,
    email: p.email || '',
    full_name: p.full_name || 'Pelanggan Polsri',
    phone: p.phone,
    role: (p.role as UserRole) || 'customer',
    avatar_url: p.avatar_url,
    address: p.address,
    city: p.city || 'Palembang',
    postal_code: p.postal_code,
    created_at: p.created_at,
  }));
}

export async function updateProfileInSupabase(
  userId: string,
  profileData: Partial<UserProfile>
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('[Supabase] updateProfile error:', error.message);
    return false;
  }
  return true;
}

