-- ============================================================
-- MyMarket — In-App Messaging (Contact Seller)
-- Run in Supabase SQL Editor. Safe to re-run (idempotent).
-- ============================================================

-- 1. CONVERSATIONS ---------------------------------------------------
-- One conversation = one buyer asking one seller about one specific product.
create table if not exists public.conversations (
  id              bigint generated always as identity primary key,
  product_id      bigint references public.products(id) on delete set null,
  buyer_id        uuid references auth.users(id) on delete cascade not null,
  seller_id       uuid references auth.users(id) on delete cascade not null,
  created_at      timestamptz default now() not null,
  last_message_at timestamptz default now() not null,
  unique (product_id, buyer_id, seller_id)
);

alter table public.conversations enable row level security;

drop policy if exists "conversations_select_participant" on public.conversations;
create policy "conversations_select_participant"
  on public.conversations for select
  to authenticated
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "conversations_insert_as_buyer" on public.conversations;
create policy "conversations_insert_as_buyer"
  on public.conversations for insert
  to authenticated
  with check (auth.uid() = buyer_id);

drop policy if exists "conversations_update_participant" on public.conversations;
create policy "conversations_update_participant"
  on public.conversations for update
  to authenticated
  using (auth.uid() = buyer_id or auth.uid() = seller_id)
  with check (auth.uid() = buyer_id or auth.uid() = seller_id);

create index if not exists conversations_buyer_id_idx on public.conversations(buyer_id);
create index if not exists conversations_seller_id_idx on public.conversations(seller_id);


-- 2. MESSAGES ----------------------------------------------------
create table if not exists public.messages (
  id              bigint generated always as identity primary key,
  conversation_id bigint references public.conversations(id) on delete cascade not null,
  sender_id       uuid references auth.users(id) on delete cascade not null,
  content         text not null check (char_length(trim(content)) > 0),
  created_at      timestamptz default now() not null,
  read_at         timestamptz
);

alter table public.messages enable row level security;

drop policy if exists "messages_select_participant" on public.messages;
create policy "messages_select_participant"
  on public.messages for select
  to authenticated
  using (
    conversation_id in (
      select id from public.conversations
      where auth.uid() = buyer_id or auth.uid() = seller_id
    )
  );

drop policy if exists "messages_insert_participant" on public.messages;
create policy "messages_insert_participant"
  on public.messages for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and conversation_id in (
      select id from public.conversations
      where auth.uid() = buyer_id or auth.uid() = seller_id
    )
  );

drop policy if exists "messages_update_participant" on public.messages;
create policy "messages_update_participant"
  on public.messages for update
  to authenticated
  using (
    conversation_id in (
      select id from public.conversations
      where auth.uid() = buyer_id or auth.uid() = seller_id
    )
  )
  with check (
    conversation_id in (
      select id from public.conversations
      where auth.uid() = buyer_id or auth.uid() = seller_id
    )
  );

create index if not exists messages_conversation_id_idx on public.messages(conversation_id);
create index if not exists messages_sender_id_idx on public.messages(sender_id);

-- 3. REALTIME ----------------------------------------------------
-- Enables live message delivery (Supabase Realtime) for the messages table.
alter publication supabase_realtime add table public.messages;

-- Note: conversations are scoped to (product_id, buyer_id, seller_id) — a
-- buyer starting a new conversation about a different product from the same
-- seller gets a separate thread, matching how most marketplaces (Etsy, etc.)
-- scope conversations per listing.