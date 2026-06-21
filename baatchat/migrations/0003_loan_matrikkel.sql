-- 0003_loan_matrikkel.sql
-- Store each loan's property matrikkel (gnr/bnr/kommune) so the project address
-- can be resolved in a SEPARATE bounded pass (Kartverket), instead of inline with
-- the WordPress pull — Workers cap subrequests per invocation (50 on the free plan).
-- `loans.address` stays the resolved street address; NULL means "not resolved yet".

ALTER TABLE loans ADD COLUMN matrikkel TEXT;  -- raw gr_br, e.g. "3301-233/120"
ALTER TABLE loans ADD COLUMN kommune   TEXT;  -- raw county hint from the property
