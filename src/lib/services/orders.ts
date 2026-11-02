import { createClient } from '@/lib/supabase/client';
import { Order, OrderItem, OrderStatus, PaymentStatus } from '@/types';

export async function fetchOrdersFromSupabase(
  userId?: string,
  isAdmin: boolean = false
): Promise<Order[] | null> {
  const supabase = createClient();
  let query = supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .order('created_at', { ascending: false });

  // If not admin and user is logged in, restrict to own orders
  if (!isAdmin && userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.warn('[Supabase] fetchOrders error:', error.message);
    return null;
  }

  return (data || []).map((row) => ({
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
    status: row.status as OrderStatus,
    payment_status: row.payment_status as PaymentStatus,
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
}

export async function fetchOrderByIdFromSupabase(orderId: string): Promise<Order | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('id', orderId)
    .single();

  if (error) {
    console.warn('[Supabase] fetchOrderById error:', error.message);
    return null;
  }

  return {
    ...data,
    shipping_fee: Number(data.shipping_fee || 0),
    total_amount: Number(data.total_amount),
    items: (data.items || []).map((i: any) => ({
      ...i,
      price: Number(i.price),
      quantity: Number(i.quantity),
      subtotal: Number(i.subtotal),
    })),
  };
}

export async function createOrderInSupabase(
  orderData: Omit<Order, 'id' | 'order_number' | 'created_at'>
): Promise<Order | null> {
  const supabase = createClient();
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `POLSRI-${dateStr}-${randomSuffix}`;

  const { items, ...orderHeader } = orderData as any;

  // 1. Insert order header
  const { data: orderResult, error: orderError } = await supabase
    .from('orders')
    .insert({
      ...orderHeader,
      order_number: orderNumber,
    })
    .select()
    .single();

  if (orderError) {
    console.error('[Supabase] createOrder error:', orderError.message);
    return null;
  }

  // 2. Insert order items if present
  let insertedItems: OrderItem[] = [];
  if (items && items.length > 0) {
    const itemsPayload = items.map((item: any) => ({
      order_id: orderResult.id,
      product_id: item.product_id || null,
      product_title: item.product_title,
      product_image: item.product_image || null,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.subtotal || item.price * item.quantity,
    }));

    const { data: itemsResult, error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsPayload)
      .select();

    if (itemsError) {
      console.warn('[Supabase] order_items insert warning:', itemsError.message);
    } else {
      insertedItems = (itemsResult || []).map((i: any) => ({
        ...i,
        price: Number(i.price),
        quantity: Number(i.quantity),
        subtotal: Number(i.subtotal),
      }));
    }
  }

  return {
    ...orderResult,
    shipping_fee: Number(orderResult.shipping_fee || 0),
    total_amount: Number(orderResult.total_amount),
    items: insertedItems.length > 0 ? insertedItems : items,
  };
}

export async function updateOrderStatusInSupabase(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string
): Promise<boolean> {
  const supabase = createClient();
  const payload: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (trackingNumber !== undefined) {
    payload.tracking_number = trackingNumber;
  }

  const { error } = await supabase
    .from('orders')
    .update(payload)
    .eq('id', orderId);

  if (error) {
    console.error('[Supabase] updateOrderStatus error:', error.message);
    return false;
  }
  return true;
}

export async function updatePaymentStatusInSupabase(
  orderId: string,
  paymentStatus: PaymentStatus,
  paymentMethod?: string
): Promise<boolean> {
  const supabase = createClient();
  const payload: any = {
    payment_status: paymentStatus,
    updated_at: new Date().toISOString(),
  };

  if (paymentMethod) {
    payload.payment_method = paymentMethod;
  }

  // If payment is successful, also move status to 'paid' if it was pending
  if (paymentStatus === 'paid') {
    payload.status = 'paid';
  }

  const { error } = await supabase
    .from('orders')
    .update(payload)
    .eq('id', orderId);

  if (error) {
    console.error('[Supabase] updatePaymentStatus error:', error.message);
    return false;
  }
  return true;
}

