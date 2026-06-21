# Deploying & versioning

## How a deploy happens

```
work on  main / feature branch  ──PR──▶  merge into  production
                                              │
                              GitHub Actions (.github/workflows/deploy.yml)
                          │  typecheck → deploy Worker (API) → build+deploy frontend (Pages) → tag
                                              ▼
                          frontend  https://chat.oblinor.no
                          API       https://oblinor-borrower-chat.bk-39a.workers.dev
```

**You never deploy from your laptop.** Merging to `production` is the deploy.
`main` and feature branches do not deploy.

## One-time setup (required before the first auto-deploy)

The workflow authenticates to Cloudflare with two GitHub repo secrets:

1. **Create a scoped Cloudflare API token** — dashboard → My Profile → API Tokens →
   *Create Token* → template **"Edit Cloudflare Workers"**, then ALSO add the
   **Cloudflare Pages → Edit** permission (CI deploys both the Worker and the Pages
   frontend). Scope it to this account. (Replaces interactive `wrangler login` for CI.)
2. **Add the secrets** — GitHub repo → Settings → Secrets and variables → Actions:
   - `CLOUDFLARE_API_TOKEN` = the token above
   - `CLOUDFLARE_ACCOUNT_ID` = `39af4244c98186e2c91588ecd54dc269`

## What version is live?

Every deploy stamps the Worker with a build number and commit:

```sh
curl https://oblinor-borrower-chat.bk-39a.workers.dev/version
# {"version":"42","commit":"<full git sha>"}
```

- `version` = the GitHub Actions run number (monotonic — higher is newer).
- `commit` = exact source it was built from.
- Each deploy also pushes a git tag `release-<version>` so the number maps to a commit.

## Going backward (rollback) and forward

Cloudflare keeps every deploy as an immutable **version**. Two ways to move between them:

**Fastest — roll back the last deploy:**
```sh
pnpm exec wrangler rollback        # reverts to the previous version, interactive
```

**Pick a specific older version:**
```sh
pnpm exec wrangler deployments list            # shows version ids + timestamps + trigger
pnpm exec wrangler rollback <version-id>       # make that version live again
```
Or use the dashboard: **Workers & Pages → oblinor-borrower-chat → Deployments →**
pick a row → **Rollback**. (`curl /version` afterwards to confirm what is live.)

**Going forward again** = either roll back off the old version, or merge the fix to
`production` (which deploys a new, higher build number).

> A rollback changes the running code but **not** the repo. If a bad release reached
> `production`, also revert it in git (`git revert`) so the next deploy doesn't re-ship it.

## Database migrations are separate

`wrangler deploy` ships **code only** — it does not run migrations. A new
`migrations/000N_*.sql` must be applied deliberately with `pnpm run db:migrate`
(remote). Don't merge a schema-dependent change to `production` before its migration
has been applied, or the live Worker will hit missing tables.
