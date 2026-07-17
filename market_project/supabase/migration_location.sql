-- ============================================================
-- Marketologi — Location (City) field for products
-- Run in Supabase SQL Editor. Safe to re-run (idempotent).
-- ============================================================

-- Add city column to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS city TEXT;
