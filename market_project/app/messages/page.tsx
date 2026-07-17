'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';

type ConversationRow = {
  id: number;
  product_id: number | null;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  products: { id: number; name: string; image_url: string | null; price: number } | null;
};

type MessageRow = {
  id: number;
  conversation_id: number;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'ახლახანს';
  if (mins < 60) return `${mins} წთ`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} სთ`;
  const days = Math.floor(hours / 24);
  return `${days} დღე`;
}

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={null}>
        <MessagesContent />
      </Suspense>
    </ProtectedRoute>
  );
}

function MessagesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialConversationId = searchParams.get('c');

  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [unreadConvoIds, setUnreadConvoIds] = useState<Set<number>>(new Set());
  const [loadingList, setLoadingList] = useState(true);

  const [activeId, setActiveId] = useState<number | null>(
    initialConversationId ? Number(initialConversationId) : null
  );
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // ---- load conversation list ----
  const loadConversations = async () => {
    if (!user) return;
    setLoadingList(true);

    const { data, error } = await supabase
      .from('conversations')
      .select('id, product_id, buyer_id, seller_id, last_message_at, products (id, name, image_url, price)')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false });

    if (!error && data) {
      setConversations(data as unknown as ConversationRow[]);
    }

    const { data: unread } = await supabase
      .from('messages')
      .select('conversation_id')
      .is('read_at', null)
      .neq('sender_id', user.id);

    if (unread) {
      setUnreadConvoIds(new Set(unread.map((m: any) => m.conversation_id)));
    }

    setLoadingList(false);
  };

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ---- load + mark-as-read the active thread ----
  useEffect(() => {
    if (!activeId || !user) return;

    const loadThread = async () => {
      setLoadingThread(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data as MessageRow[]);
      }
      setLoadingThread(false);

      // mark incoming messages as read
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', activeId)
        .neq('sender_id', user.id)
        .is('read_at', null);

      setUnreadConvoIds((prev) => {
        const next = new Set(prev);
        next.delete(activeId);
        return next;
      });
    };

    loadThread();
  }, [activeId, user]);

  // ---- realtime: live messages for the open thread ----
  useEffect(() => {
    if (!activeId) return;

    const channel = supabase
      .channel(`conversation-${activeId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as MessageRow]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  async function handleSend() {
    if (!draft.trim() || !activeId || !user) return;
    setSending(true);

    const content = draft.trim();

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: activeId,
        sender_id: user.id,
        content,
      });

      if (error) throw error;

      setDraft('');

      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', activeId);
      loadConversations();
    } catch (err: any) {
      alert('გაგზავნა ვერ მოხერხდა: ' + (err?.message ?? 'უცნობი შეცდომა'));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-brand-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">შეტყობინებები</h1>

        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-5 bg-card-bg border border-border-subtle rounded-2xl overflow-hidden min-h-[70vh]">
          {/* ---- conversation list ---- */}
          <div className={`border-r border-border-subtle ${activeId ? 'hidden md:block' : ''}`}>
            <div className="max-h-[75vh] overflow-y-auto">
              {loadingList ? (
                <div className="p-4 flex flex-col gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-card-hover animate-pulse" />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-text-muted text-sm">
                  ჯერ არცერთი საუბარი არ გაქვთ. დაუკავშირდი გამყიდველს ნივთის გვერდიდან
                  „შეტყობინების გაგზავნა" ღილაკით.
                </div>
              ) : (
                conversations.map((c) => {
                  const iAmBuyer = c.buyer_id === user?.id;
                  const isUnread = unreadConvoIds.has(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveId(c.id)}
                      className={`w-full flex items-center gap-3 p-4 text-left border-b border-border-subtle transition-colors ${
                        activeId === c.id ? 'bg-vip-border/10' : 'hover:bg-card-hover'
                      }`}
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-input-bg shrink-0">
                        {c.products?.image_url ? (
                          <img src={c.products.image_url} alt={c.products.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">🛍️</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm truncate ${isUnread ? 'font-semibold text-text-primary' : 'font-medium text-text-primary'}`}>
                            {c.products?.name ?? 'წაშლილი ნივთი'}
                          </p>
                          {isUnread && <span className="w-2 h-2 rounded-full bg-vip-border shrink-0" />}
                        </div>
                        <p className="text-xs text-text-muted truncate">
                          {iAmBuyer ? 'გამყიდველთან' : 'მყიდველთან'} · {timeAgo(c.last_message_at)}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ---- active thread ---- */}
          <div className={`flex flex-col ${activeId ? '' : 'hidden md:flex'}`}>
            {!activeConversation ? (
              <div className="flex-1 flex items-center justify-center text-text-muted text-sm p-8 text-center">
                აირჩიე საუბარი მარცხნიდან
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border-subtle">
                  <button
                    onClick={() => setActiveId(null)}
                    className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-card-hover"
                  >
                    ←
                  </button>
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-input-bg shrink-0">
                    {activeConversation.products?.image_url ? (
                      <img
                        src={activeConversation.products.image_url}
                        alt={activeConversation.products.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm">🛍️</div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {activeConversation.products?.name ?? 'წაშლილი ნივთი'}
                    </p>
                    {activeConversation.products && (
                      <p className="text-xs text-emerald-600 font-medium">
                        {activeConversation.products.price} ₾
                      </p>
                    )}
                  </div>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
                  {loadingThread ? (
                    <p className="text-center text-text-muted text-sm">იტვირთება...</p>
                  ) : messages.length === 0 ? (
                    <p className="text-center text-text-muted text-sm py-10">
                      დაწერე პირველი შეტყობინება 👋
                    </p>
                  ) : (
                    messages.map((m) => {
                      const mine = m.sender_id === user?.id;
                      return (
                        <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                              mine
                                ? 'bg-vip-border text-[#1c1c1c] rounded-br-sm'
                                : 'bg-card-hover text-text-primary rounded-bl-sm'
                            }`}
                          >
                            {m.content}
                            <div className={`text-[10px] mt-1 ${mine ? 'text-black/50' : 'text-text-muted'}`}>
                              {new Date(m.created_at).toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-4 border-t border-border-subtle flex items-center gap-3">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="დაწერე შეტყობინება..."
                    className="flex-1 bg-input-bg border border-border-subtle focus:border-vip-border rounded-full px-4 py-2.5 text-sm outline-none transition-colors"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !draft.trim()}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-vip-border hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1c1c1c" strokeWidth={2}>
                      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}