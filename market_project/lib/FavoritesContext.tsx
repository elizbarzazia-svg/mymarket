'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';

type FavoritesContextType = {
  favoriteIds: Set<string>;
  loading: boolean;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  favoritesCount: number;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      if (!user) {
        setFavoriteIds(new Set());
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);

      if (!cancelled) {
        if (!error && data) {
          setFavoriteIds(new Set(data.map((row) => row.product_id)));
        }
        setLoading(false);
      }
    }

    loadFavorites();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.has(productId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (productId: string) => {
      if (!user) return; // caller (FavoriteButton) handles redirect to /login

      const alreadyFavorite = favoriteIds.has(productId);

      // Optimistic update — feels instant, matches the rest of the app's snappy UX
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        alreadyFavorite ? next.delete(productId) : next.add(productId);
        return next;
      });

      if (alreadyFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) {
          // revert on failure
          setFavoriteIds((prev) => new Set(prev).add(productId));
        }
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, product_id: productId });

        if (error) {
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
        }
      }
    },
    [user, favoriteIds]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        loading,
        isFavorite,
        toggleFavorite,
        favoritesCount: favoriteIds.size,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return ctx;
}