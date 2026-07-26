-- ================================================================
-- FREERT Support Tickets Schema Upgrade
-- Run this query in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- ================================================================

-- 1. Add admin_reply column to support_tickets if it doesn't exist
ALTER TABLE public.support_tickets 
  ADD COLUMN IF NOT EXISTS admin_reply text;

-- 2. Update column comment for tracking
COMMENT ON COLUMN public.support_tickets.admin_reply IS 'Store replies submitted by administrators';
