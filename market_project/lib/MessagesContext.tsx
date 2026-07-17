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

type MessagesContextType = {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
};

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    // Step 1: which conversations am I part of?
    const { data: convos, error: convoError } = await supabase
      .from('conversations')
      .select('id')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

    if (convoError || !convos || convos.length === 0) {
      setUnreadCount(0);
      return;
    }

    const conversationIds = convos.map((c) => c.id);

    // Step 2: how many unread messages (sent by the other person) sit in those conversations?
    const { count, error: msgError } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .is('read_at', null)
      .neq('sender_id', user.id);

    if (!msgError) {
      setUnreadCount(count ?? 0);
    }
  }, [user]);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  // Live-update the badge when a new message arrives anywhere for this user.
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('unread-messages-badge')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          refreshUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshUnreadCount]);

  return (
    <MessagesContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return ctx;
}