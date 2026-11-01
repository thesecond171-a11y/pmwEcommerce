export type UserRole = 'admin' | 'customer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image_url?: string;
  description?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id?: string;
  category?: Category;
  title: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  student_name: string;
  jurusan: string;
  nim?: string;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
  rating: number;
  sold_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  user_id?: string;
  product_id: string;
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'paid' | 'expired' | 'failed';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  product_image?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code?: string;
  shipping_method: string;
  shipping_fee: number;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: string;
  snap_token?: string;
  snap_redirect_url?: string;
  tracking_number?: string;
  notes?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at?: string;
}
