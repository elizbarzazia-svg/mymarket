'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '../lib/AuthContext';
import { LanguageProvider } from '../lib/LanguageContext';
import { FavoritesProvider } from '@/lib/FavoritesContext';
import { CartProvider } from '@/lib/CartContext';
import { MessagesProvider } from '@/lib/MessagesContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <FavoritesProvider>
          <CartProvider>
            <MessagesProvider>
              {children}
            </MessagesProvider>
          </CartProvider>
        </FavoritesProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}