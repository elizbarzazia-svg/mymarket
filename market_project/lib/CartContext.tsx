'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';

export type CartProduct = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  phone: string | null;
  user_id?: string;
};

export type CartItem = {
  product_id: string;
  quantity: number;
  product: CartProduct;
};

type CartContextType = {
  items: CartItem[];
  loading: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: CartProduct, quantity?: number) => Promise<void>;
  buyNow: (product: CartProduct) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  isInCart: (productId: string) => boolean;
  revealedPhoneIds: Set<string>;
  revealPhone: (productId: string) => void;
  totalCount: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [revealedPhoneIds, setRevealedPhoneIds] = useState<Set<string>>(new Set());

  const revealPhone = useCallback((productId: string) => {
    setRevealedPhoneIds((prev) => new Set(prev).add(productId));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCart() {
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('cart_items')
        .select('product_id, quantity, products (id, name, price, image_url, phone, user_id)')
        .eq('user_id', user.id);

      if (!cancelled) {
        if (!error && data) {
          const mapped: CartItem[] = data
            .filter((row: any) => row.products) // drop rows whose product was deleted
            .map((row: any) => ({
              product_id: row.product_id,
              quantity: row.quantity,
              product: row.products,
            }));
          setItems(mapped);
        }
        setLoading(false);
      }
    }

    loadCart();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const addToCart = useCallback(
    async (product: CartProduct, quantity: number = 1) => {
      if (!user) return; // caller handles redirect to /login

      const existing = items.find((i) => i.product_id === product.id);

      if (existing) {
        const newQty = existing.quantity + quantity;
        setItems((prev) =>
          prev.map((i) =>
            i.product_id === product.id ? { ...i, quantity: newQty } : i
          )
        );
        await supabase
          .from('cart_items')
          .update({ quantity: newQty })
          .eq('user_id', user.id)
          .eq('product_id', product.id);
      } else {
        setItems((prev) => [...prev, { product_id: product.id, quantity, product }]);
        await supabase
          .from('cart_items')
          .insert({ user_id: user.id, product_id: product.id, quantity });
      }

      setIsOpen(true);
    },
    [user, items]
  );

  const buyNow = useCallback(
    async (product: CartProduct) => {
      if (!user) return; // caller handles redirect to /login
      await addToCart(product, 1);
      revealPhone(product.id);
      setIsOpen(true);
    },
    [user, addToCart, revealPhone]
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      if (!user) return;
      setItems((prev) => prev.filter((i) => i.product_id !== productId));
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
    },
    [user]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (!user) return;
      if (quantity < 1) {
        await removeFromCart(productId);
        return;
      }
      setItems((prev) =>
        prev.map((i) => (i.product_id === productId ? { ...i, quantity } : i))
      );
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId);
    },
    [user, removeFromCart]
  );

  const isInCart = useCallback(
    (productId: string) => items.some((i) => i.product_id === productId),
    [items]
  );

  const totalCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.product.price, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addToCart,
        buyNow,
        removeFromCart,
        updateQuantity,
        isInCart,
        revealedPhoneIds,
        revealPhone,
        totalCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}