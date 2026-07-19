# Expense Tracker

Personal expense tracker — capture, dashboard, masters. See **`AGENTS.md`** first if
you're an AI agent picking this up; it has the architecture decisions and
conventions this scaffold assumes.

## Status

This is a working scaffold, not a finished app:
- Auth wiring, API client, and the **Capture** screen are fully implemented.
- **Dashboard** and **Masters** are implemented against the *assumed* API shape in
  `AGENTS.md` — verify against your actual API Gateway routes and adjust
  `lib/queries/*.ts` if they differ.
- Nothing has been run against the real backend yet in this environment (no network
  access to your AWS account from where this was generated).

## Setup

```bash
npm install
cp .env.local.example .env.local
# then fill in .env.local:
#   - OIDC authority/client_id: copy from trent-web's auth config
#   - Register the redirect_uri below as an additional allowed redirect
#     URI on that same OIDC app registration
#   - API base URL + key: from your API Gateway
npm run dev
```

## Before this is real

1. Confirm the actual API Gateway route paths/response shapes and update
   `lib/queries/expenses.ts` and `lib/queries/masters.ts` to match.
2. Register this app's redirect URI with your OIDC provider.
3. Decide on hosting (Vercel is the path of least resistance for Next.js; or S3 +
   CloudFront to match how trent-web is likely hosted).
4. Add `shadcn/ui` if you want richer components — run `npx shadcn@latest init`
   locally (needs real internet access) rather than hand-copying components.
