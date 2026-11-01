'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, CartItem, Order, UserProfile, OrderStatus, PaymentStatus } from '@/types';
import { mockCategories, mockProducts, mockOrders, mockUsers } from '@/lib/mock-data';

interface AppContextType {
  // Auth & Role
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  switchUserRole: (role: 'admin' | 'customer') => void;
  logout: () => void;
  isAdmin: boolean;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'slug' | 'rating' | 'sold_count'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateStock: (id: string, newStock: number) => void;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'slug'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

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
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string) => void;
  updatePaymentStatus: (orderId: string, paymentStatus: PaymentStatus, paymentMethod?: string) => void;
  getOrderById: (orderId: string) => Order | undefined;

  // Filters & Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // User state
  const [user, setUser] = useState<UserProfile | null>(mockUsers.customer);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('pmw_user');
      if (savedUser) setUser(JSON.parse(savedUser));

      const savedProducts = localStorage.getItem('pmw_products');
      if (savedProducts) setProducts(JSON.parse(savedProducts));

      const savedCategories = localStorage.getItem('pmw_categories');
      if (savedCategories) setCategories(JSON.parse(savedCategories));

      const savedCart = localStorage.getItem('pmw_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedOrders = localStorage.getItem('pmw_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    setIsHydrated(true);
  }, []);

  // Save changes to LocalStorage
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
      localStorage.setItem('pmw_products', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('pmw_categories', JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }, [categories, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('pmw_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('pmw_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders, isHydrated]);

  // Role switch helper
  const switchUserRole = (role: 'admin' | 'customer') => {
    setUser(mockUsers[role]);
  };

  const logout = () => {
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  // Product operations
  const addProduct = (newProd: Omit<Product, 'id' | 'slug' | 'rating' | 'sold_count'>) => {
    const slug = newProd.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const product: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
      slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
      rating: 5.0,
      sold_count: 0,
      created_at: new Date().toISOString(),
    };
    setProducts((prev) => [product, ...prev]);
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields, updated_at: new Date().toISOString() } : item))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  const updateStock = (id: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock: Math.max(0, newStock) } : item))
    );
  };

  // Category operations
  const addCategory = (cat: Omit<Category, 'id' | 'slug'>) => {
    const slug = cat.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const newCategory: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
      slug,
      created_at: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updatedFields: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((item) => item.id !== id));
  };

  // Cart operations
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
          const maxStock = item.product.stock;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Orders operations
  const createOrder = (orderData: Omit<Order, 'id' | 'order_number' | 'created_at'>): Order => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `POLSRI-${dateStr}-${randomSuffix}`;

    const newOrder: Order = {
      ...orderData,
      id: `order-${Date.now()}`,
      order_number: orderNumber,
      created_at: today.toISOString(),
    };

    // Deduct product stock
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
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, trackingNumber?: string) => {
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
  };

  const updatePaymentStatus = (orderId: string, paymentStatus: PaymentStatus, paymentMethod?: string) => {
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

