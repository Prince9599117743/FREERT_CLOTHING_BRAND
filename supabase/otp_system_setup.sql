-- ================================================================
-- FREERT OTP System Cleanup
-- Run this in Supabase SQL Editor
-- ================================================================

-- 1. Function to auto-delete expired OTPs from support_tickets
-- (OTPs older than 15 minutes with status starting with 'otp_')
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM support_tickets
  WHERE status LIKE 'otp_%'
    AND created_at < NOW() - INTERVAL '15 minutes';
END;
$$;

-- 2. Schedule cleanup to run every 5 minutes via pg_cron
-- (pg_cron is available on Supabase Pro — on free tier, cleanup happens in code)
-- Uncomment below only if you are on Supabase Pro plan:
-- SELECT cron.schedule('cleanup-otp-records', '*/5 * * * *', 'SELECT cleanup_expired_otps()');

-- 3. Index for fast OTP lookups (email + status filter)
CREATE INDEX IF NOT EXISTS idx_support_tickets_otp_email_status
  ON support_tickets(email, status)
  WHERE status LIKE 'otp_%';

-- 4. Index for created_at to speed up expiry cleanup
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at
  ON support_tickets(created_at);

-- ================================================================
-- VERIFICATION: Run this to confirm indexes were created
-- ================================================================
SELECT indexname, tablename
FROM pg_indexes
WHERE tablename = 'support_tickets'
ORDER BY indexname;
