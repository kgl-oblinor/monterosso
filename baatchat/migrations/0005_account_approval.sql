-- 0005_account_approval.sql
-- Admin approval gate: a claimed account is `pending` until an admin approves it; only
-- `active` investors/loaners can chat. `email_verified` records that the user proved the
-- on-file email (set automatically on code verification, or manually by an admin).
-- chat_accounts.status already exists (default 'active'); new accounts are inserted as
-- 'pending' by the register flow.

ALTER TABLE chat_accounts ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;
