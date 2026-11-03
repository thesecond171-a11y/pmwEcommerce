'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Category, CartItem, Order, UserProfile, OrderStatus, PaymentStatus } from '@/types';
import { mockCategories, mockProducts, mockOrders, mockUsers } from '@/lib/mock-data';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  fetchProductsFromSupabase,
  createProductInSupabase,
  updateProductInSupabase,
  deleteProductInSupabase,
  updateProductStockInSupabase,
} from '@/lib/services/products';
import {
  fetchCategoriesFromSupabase,
  createCategoryInSupabase,
  updateCategoryInSupabase,
  deleteCategoryInSupabase,
} from '@/lib/services/categories';
import {
  fetchOrdersFromSupabase,
  createOrderInSupabase,
  updateOrderStatusInSupabase,
  updatePaymentStatusInSupabase,
} from '@/lib/services/orders';
import { signOutFromSupabase } from '@/lib/services/auth';

interface AppContextType {
  // Auth & Role
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  switchUserRole: (role: 'admin' | 'customer') => void;
  logout: () => void;
  isAdmin: boolean;

  // Supabase Status
  isSupabaseLive: boolean;
  isLoadingData: boolean;
  refreshData: () => Promise<void>;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'slug' | 'rating' | 'sold_count'>) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  updateStock: (id: string, newStock: number) => Promise<boolean>;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'slug'>) => Promise<Category>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Orders
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'order_number' | 'created_at'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string) => Promise<boolean>;
  updatePaymentStatus: (orderId: string, paymentStatus: PaymentStatus, paymentMethod?: string) => Promise<boolean>;
  getOrderById: (orderId: string) => Order | undefined;

  // Filters & Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // User state - defaults to null (logged out / guest)
  const [user, setUser] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Synchronize data from Supabase
  const refreshData = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setIsLoadingData(true);

    try {
      // 1. Fetch categories
      const liveCategories = await fetchCategoriesFromSupabase();
      if (liveCategories) {
        setCategories(liveCategories);
        setIsSupabaseLive(true);
      }

      // 2. Fetch products
      const liveProducts = await fetchProductsFromSupabase();
      if (liveProducts) {
        setProducts(liveProducts);
        setIsSupabaseLive(true);
      }

      // 3. Fetch orders directly from Supabase
      const liveOrders = await fetchOrdersFromSupabase(undefined, true);
      if (liveOrders) {
        setOrders(liveOrders);
      }
    } catch (err) {
      console.warn('[AppContext] Supabase sync fallback:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Initial load from LocalStorage first (for instant rendering), then sync with Supabase
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('pmw_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          // Only restore if not old dummy mock users
          if (parsed && parsed.id && parsed.id !== 'cust-01' && parsed.id !== 'admin-01') {
            setUser(parsed);
          } else {
            localStorage.removeItem('pmw_user');
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      }

      const savedCart = localStorage.getItem('pmw_cart');
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) {
            const valid = parsed.filter(
              (item: any) =>
                item && item.product && item.product.id && typeof item.product.price === 'number'
            );
            setCart(valid);
          }
        } catch {
          setCart([]);
        }
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    setIsHydrated(true);

    // Initial sync with live Supabase database
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Supabase Auth listener
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const role = profile?.role || session.user.user_metadata?.role || 'customer';
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: profile?.full_name || session.user.user_metadata?.full_name || 'Pengguna Polsri',
          phone: profile?.phone || session.user.user_metadata?.phone,
          role,
          avatar_url: profile?.avatar_url,
          address: profile?.address,
          city: profile?.city || 'Palembang',
          postal_code: profile?.postal_code,
          created_at: profile?.created_at,
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        try {
          localStorage.removeItem('pmw_user');
        } catch {}
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Save changes to LocalStorage for offline cache & persistence
  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (user) localStorage.setItem('pmw_user', JSON.stringify(user));
      else localStorage.removeItem('pmw_user');
    } catch (e) {
      console.error(e);
    }
  }, [user, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('pmw_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart, isHydrated]);

  // Role switch helper (kept for safe fallback if called)
  const switchUserRole = (role: 'admin' | 'customer') => {
    setUser(mockUsers[role]);
  };

  const logout = async () => {
    try {
      await signOutFromSupabase();
    } catch {
      // ignore
    }
    try {
      localStorage.removeItem('pmw_user');
    } catch {}
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  // ==========================================
  // PRODUCT OPERATIONS (Supabase + Optimistic)
  // ==========================================
  const addProduct = async (
    newProd: Omit<Product, 'id' | 'slug' | 'rating' | 'sold_count'>
  ): Promise<Product> => {
    const slug = newProd.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const tempId = `prod-${Date.now()}`;
    const optimisticProduct: Product = {
      ...newProd,
      id: tempId,
      slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
      rating: 5.0,
      sold_count: 0,
      created_at: new Date().toISOString(),
    };

    // Optimistic UI update
    setProducts((prev) => [optimisticProduct, ...prev]);

    // Send to Supabase
    if (isSupabaseConfigured()) {
      try {
        const liveCreated = await createProductInSupabase(newProd);
        if (liveCreated) {
          setProducts((prev) =>
            prev.map((p) => (p.id === tempId ? liveCreated : p))
          );
          return liveCreated;
        }
      } catch (err) {
        console.warn('[Supabase] addProduct fallback to local:', err);
      }
    }

    return optimisticProduct;
  };

  const updateProduct = async (
    id: string,
    updatedFields: Partial<Product>
  ): Promise<boolean> => {
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...updatedFields, updated_at: new Date().toISOString() }
          : item
      )
    );

    // Send to Supabase
    if (isSupabaseConfigured()) {
      try {
        await updateProductInSupabase(id, updatedFields);
      } catch (err) {
        console.warn('[Supabase] updateProduct fallback:', err);
      }
    }
    return true;
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    // Optimistic UI update
    setProducts((prev) => prev.filter((item) => item.id !== id));

    // Send to Supabase
    if (isSupabaseConfigured()) {
      try {
        await deleteProductInSupabase(id);
      } catch (err) {
        console.warn('[Supabase] deleteProduct fallback:', err);
      }
    }
    return true;
  };

  const updateStock = async (id: string, newStock: number): Promise<boolean> => {
    const safeStock = Math.max(0, newStock);
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock: safeStock } : item))
    );

    // Send to Supabase
    if (isSupabaseConfigured()) {
      try {
        await updateProductStockInSupabase(id, safeStock);
      } catch (err) {
        console.warn('[Supabase] updateStock fallback:', err);
      }
    }
    return true;
  };

  // ==========================================
  // CATEGORY OPERATIONS (Supabase + Optimistic)
  // ==========================================
  const addCategory = async (
    cat: Omit<Category, 'id' | 'slug'>
  ): Promise<Category> => {
    const slug = cat.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const tempId = `cat-${Date.now()}`;
    const optimisticCategory: Category = {
      ...cat,
      id: tempId,
      slug,
      created_at: new Date().toISOString(),
    };

    setCategories((prev) => [...prev, optimisticCategory]);

    if (isSupabaseConfigured()) {
      try {
        const liveCreated = await createCategoryInSupabase(cat);
        if (liveCreated) {
          setCategories((prev) =>
            prev.map((c) => (c.id === tempId ? liveCreated : c))
          );
          return liveCreated;
        }
      } catch (err) {
        console.warn('[Supabase] addCategory fallback:', err);
      }
    }

    return optimisticCategory;
  };

  const updateCategory = async (
    id: string,
    updatedFields: Partial<Category>
  ): Promise<boolean> => {
    setCategories((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );

    if (isSupabaseConfigured()) {
      try {
        await updateCategoryInSupabase(id, updatedFields);
      } catch (err) {
        console.warn('[Supabase] updateCategory fallback:', err);
      }
    }
    return true;
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    setCategories((prev) => prev.filter((item) => item.id !== id));

    if (isSupabaseConfigured()) {
      try {
        await deleteCategoryInSupabase(id);
      } catch (err) {
        console.warn('[Supabase] deleteCategory fallback:', err);
      }
    }
    return true;
  };

  // ==========================================
  // CART OPERATIONS
  // ==========================================
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            user_id: user?.id,
            product_id: product.id,
            product,
            quantity: Math.min(quantity, product.stock),
          },
        ];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product_id === productId) {
          const maxStock = item.product?.stock ?? 99;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (acc, item) => acc + (item?.product?.price || 0) * (item?.quantity || 0),
    0
  );
  const cartCount = cart.reduce((acc, item) => acc + (item?.quantity || 0), 0);

  // ==========================================
  // ORDER OPERATIONS (Supabase + Optimistic)
  // ==========================================
  const createOrder = (
    orderData: Omit<Order, 'id' | 'order_number' | 'created_at'>
  ): Order => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `POLSRI-${dateStr}-${randomSuffix}`;

    const tempId = `order-${Date.now()}`;
    const newOrder: Order = {
      ...orderData,
      id: tempId,
      order_number: orderNumber,
      created_at: today.toISOString(),
    };

    // Deduct product stock locally
    if (newOrder.items) {
      newOrder.items.forEach((item) => {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === item.product_id
              ? {
                ...p,
                stock: Math.max(0, p.stock - item.quantity),
                sold_count: p.sold_count + item.quantity,
              }
              : p
          )
        );
      });
    }

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    // Send to Supabase asynchronously
    if (isSupabaseConfigured()) {
      createOrderInSupabase(orderData)
        .then((liveOrder) => {
          if (liveOrder) {
            setOrders((prev) =>
              prev.map((o) => (o.id === tempId ? liveOrder : o))
            );
          }
        })
        .catch((err) => {
          console.warn('[Supabase] createOrder async fallback:', err);
        });
    }

    return newOrder;
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string
  ): Promise<boolean> => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status,
            tracking_number: trackingNumber || order.tracking_number,
            updated_at: new Date().toISOString(),
          };
        }
        return order;
      })
    );

    if (isSupabaseConfigured()) {
      try {
        await updateOrderStatusInSupabase(orderId, status, trackingNumber);
      } catch (err) {
        console.warn('[Supabase] updateOrderStatus fallback:', err);
      }
    }
    return true;
  };

  const updatePaymentStatus = async (
    orderId: string,
    paymentStatus: PaymentStatus,
    paymentMethod?: string
  ): Promise<boolean> => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            payment_status: paymentStatus,
            payment_method: paymentMethod || order.payment_method,
            status: paymentStatus === 'paid' ? 'paid' : order.status,
            updated_at: new Date().toISOString(),
          };
        }
        return order;
      })
    );

    if (isSupabaseConfigured()) {
      try {
        await updatePaymentStatusInSupabase(orderId, paymentStatus, paymentMethod);
      } catch (err) {
        console.warn('[Supabase] updatePaymentStatus fallback:', err);
      }
    }
    return true;
  };

  const getOrderById = (orderId: string) => {
    return orders.find((o) => o.id === orderId || o.order_number === orderId);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        switchUserRole,
        logout,
        isAdmin,
        isSupabaseLive,
        isLoadingData,
        refreshData,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
        orders,
        createOrder,
        updateOrderStatus,
        updatePaymentStatus,
        getOrderById,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
