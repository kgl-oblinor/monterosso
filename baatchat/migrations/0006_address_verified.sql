-- 0006_address_verified.sql
-- Decision (2026-06-16): use the loan's `mapaddress` (clean street+postal+city, present
-- on ~every loan) as the primary `loans.address`. Kartverket resolution only matched ~40%
-- because Oblinor carries inconsistent/stale (pre-2024 Viken) kommune codes — so keep the
-- Kartverket-resolved official address as a separate "verified" cross-check column.
ALTER TABLE loans ADD COLUMN address_verified TEXT;  -- Kartverket-resolved official address (nullable)

-- Preserve the Kartverket results we already resolved into the new column, since `address`
-- is about to be repopulated from mapaddress by the next sync.
UPDATE loans SET address_verified = address WHERE address IS NOT NULL;
