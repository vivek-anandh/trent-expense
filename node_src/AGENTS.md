# AGENTS.md — Expense Tracker

This file is the brief for any AI coding agent (Claude Code, Cursor, etc.) working on
this repo. Read it before making changes. Keep it updated if conventions change.

## What this app is

A personal expense tracker with three screens:

1. **Capture** (`/capture`) — quick-entry form to log a new expense.
2. **Dashboard** (`/dashboard`) — spend overview: totals, trend over time, breakdown
   by category. This is the landing page after login.
3. **Masters** (`/masters`) — CRUD for reference data: expense categories, payment
   methods, and anything else the capture form needs as a dropdown. Table + modal
   form, same pattern as the fund editing screens in the sibling `trent-web` project.

## Stack (do not deviate without a good reason)

| Concern | Choice |
|---|---|
| Framework | Next.js 15, App Router, TypeScript strict mode |
| Styling | Tailwind CSS. Plain utility classes for now; if `shadcn/ui` is added later, run its CLI rather than hand-copying components |
| Auth | `react-oidc-context` (wraps `oidc-client-ts`), Authorization Code + PKCE |
| Data fetching | TanStack Query (`@tanstack/react-query`) — every API call goes through a query/mutation hook in `lib/`, never a raw `fetch` inside a component |
| Forms | `react-hook-form` + `zod` for schema validation |
| Charts | `recharts` |
| Backend | Existing AWS API Gateway → Lambda → DynamoDB (see below). This repo is frontend-only. |

## Auth

Reuses the **same OIDC provider/app registration as the mutual-fund app (trent-web)**.
- `authority` and `client_id`: copy from trent-web's auth config (currently bundled
  inside its `Login.js`) into `.env.local` — do not hardcode them in source.
- **You must register a new `redirect_uri` with the IdP** for this app's domain —
  the trent-web redirect URI will not work here.
- Config lives in `lib/auth-config.ts`. Provider wiring is in
  `components/providers/auth-provider.tsx`, mounted once in `app/layout.tsx`.
- Use the `useAuth()` hook from `react-oidc-context` in any component that needs
  the current user or access token. Don't build a second auth mechanism.

## API integration

- All calls go through `lib/api-client.ts`, which attaches
  `Authorization: Bearer <access_token>` from the OIDC session automatically.
- trent-web's backend also expects a static `X-API-KEY` header — same pattern here,
  read from `NEXT_PUBLIC_API_KEY` in `.env.local`. **Known weakness inherited from
  trent-web:** this key is visible client-side since it's a SPA calling API Gateway
  directly. Fine to keep for now to match the existing backend; flag it if you ever
  add a proper backend-for-frontend layer.
- Base URL: `NEXT_PUBLIC_API_BASE_URL` in `.env.local`.
- Expected DynamoDB-backed endpoints (confirm exact paths/shapes against the actual
  API Gateway config — these are assumed, not verified):
  - `GET /expenses` — list, supports date-range query params
  - `POST /expenses` — create
  - `PUT /expenses/{id}` / `DELETE /expenses/{id}`
  - `GET /masters/categories`, `POST/PUT/DELETE /masters/categories/{id}`
  - `GET /masters/payment-methods`, `POST/PUT/DELETE /masters/payment-methods/{id}`
  - `GET /dashboard/summary?from=&to=` — aggregate totals; if this endpoint doesn't
    exist yet, compute aggregates client-side from `GET /expenses` instead of adding
    new Lambda work unless asked.

## Conventions for adding a screen/feature

1. Types first, in `types/`. No `any`.
2. One TanStack Query hook per resource in `lib/` (e.g. `useExpenses()`,
   `useCreateExpense()`), not inline fetches in components.
3. Forms: `zod` schema next to the form component, `react-hook-form` +
   `zodResolver`. Validate on the client; the Lambda is the source of truth for
   server-side validation.
4. Keep components small and single-purpose — this project got painful in its
   previous AngularJS incarnation specifically because logic and markup were
   tangled in large files with global functions. Don't repeat that here: no
   module-level mutable state, no functions attached to `window`.
5. Money is always in minor units (paise) internally; format to ₹ only at render
   time via `lib/utils.ts#formatCurrency`.
6. Dates: store/transmit ISO 8601; format for display only in the component.

## Not yet decided / ask the user before assuming

- Exact DynamoDB schema / API Gateway route shapes (listed above are placeholders).
- Multi-currency? Assume INR-only unless told otherwise.
- Recurring expenses — out of scope unless requested.
