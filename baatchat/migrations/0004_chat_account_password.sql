-- 0004_chat_account_password.sql
-- Password login (account-claim flow): existing Oblinor investors/loaners verify their
-- email, then set a password stored here as a salted PBKDF2 hash (never plaintext).
-- Format: "pbkdf2$<iterations>$<saltB64>$<hashB64>".

ALTER TABLE chat_accounts ADD COLUMN password_hash TEXT;
