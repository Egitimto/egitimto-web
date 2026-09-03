# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Next.js rebuild of `egitimto.org` (Eğitim Teknoloji ve Oyun Derneği — a Turkish nonprofit association). Public marketing site + an admin panel for non-technical staff to manage content, backed by Supabase (Postgres + Auth + Storage). Content and UI copy are primarily Turkish; the site also serves an English locale.

Design/requirements history lives in `docs/superpowers/specs/` (one file per phase, dated) and matching implementation plans in `docs/superpowers/plans/`. Read the relevant spec before making structural changes to a section — it documents *why* things are the way they are (e.g. why certain fields exist, RLS decisions, content-migration notes from the legacy PHP site).

## Commands

```bash
npm run dev         # start dev server (localhost:3000)
npm run build       # production build (also type-checks)
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm run test        # vitest run (all tests, single pass, no watch)
npx vitest run src/lib/slugify.test.ts   # run a single test file
npx vitest                                # watch mode
```

There is no `.env.local` in the repo (gitignored). It needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.local.example`) — get these from the Supabase project's API settings, or via the Supabase MCP tools (`get_project_url` / `get_publishable_keys`) if connected. Without them, any route touching `createClient()` throws at request time even though `next build` still succeeds (those routes are dynamic, not statically analyzed at build).

CI (`.github/workflows/ci.yml`) runs lint + typecheck + test + build on push.

## Architecture

**Two route groups under `src/app/`, deliberately isolated:**
- `src/app/(site)/**` — the public site. Its own `layout.tsx` renders `<Header>`/`<Footer>`. Route group folders don't affect the URL (`(site)/hakkimizda/page.tsx` → `/hakkimizda`).
- `src/app/admin/**` — the admin panel, protected by `src/app/admin/(protected)/layout.tsx`. It does **not** inherit the `(site)` header/footer because Next.js layouts nest downward only — a child layout can't strip markup a parent layout already rendered, so the two are kept as siblings under the root layout instead of one containing the other.
- The root `src/app/layout.tsx` stays minimal (fonts, `<html>/<body>`, locale for the `lang` attribute) — it must not render Header/Footer directly, or they'd leak into `/admin/*` too.

**Auth/authorization is enforced in three independent layers — all three must agree when adding a new protected resource:**
1. `middleware.ts` — redirects unauthenticated requests away from `/admin/*` (session check only, no role check).
2. Page-level: every admin page calls `requireSection('<section>')` (`src/lib/auth/require-section.ts`), which redirects out if the signed-in user's role can't access that `AdminSection` (`src/lib/auth/roles.ts` — `canAccessSection`). This only gates the UI/redirect, not the underlying data.
3. **Supabase RLS policies** (`supabase/migrations/`) are the actual enforcement layer — Server Actions call `createClient()` with the user's session and rely on RLS to reject writes, not on their own role checks. `public.current_user_role()` (SQL, security definer) is what RLS policies call to read the caller's role from `user_roles`. When adding a new table/mutation, a matching RLS policy is not optional — a missing one either silently blocks everyone (fails closed, e.g. what happened with `contact_messages` deletes until a policy was added) or, worse, fails open.

**`AdminSection`** (`src/lib/auth/roles.ts`) is the single source of truth for which admin areas exist and who can reach them (`admin` vs `moderator`, `MODERATOR_SECTIONS` list). Adding a section means updating this type, the nav in `src/app/admin/(protected)/layout.tsx`, and the RLS policy on whatever table backs it.

**Content mutation is Server Actions only — no API routes.** Every admin CRUD area follows the same three-file shape: `page.tsx` (list, or single form for singleton content like Hakkımızda), `actions.ts` (`upsertX`/`deleteX`), `[id]/page.tsx` (create/edit form, `id === 'new'` for create). Errors surface via `redirect('...?error=...')` back to the same form rather than client-side state — consistent everywhere, including the public `/iletisim` form's Server Action.

**File uploads** go through `uploadToStorage(supabase, bucket, file)` (`src/lib/storage-upload.ts`) inside the relevant Server Action, straight into a Supabase Storage bucket (`team-photos`, `partnership-logos`, `news-events-covers`, `document-files`) — there's no separate upload endpoint. Forms carry a hidden `existing_<field>` input so the action can fall back to the current URL when no new file is chosen.

**Any URL rendered from the database as `href`/`src` must go through `isSafeHttpUrl()` (`src/lib/url-safety.ts`) first** — content fields (PDF links, apply-button URLs) are treated as untrusted input to prevent `javascript:`-scheme XSS once non-admins or compromised admin input can reach them.

**i18n is cookie-based, not routed.** `getLocale()` (`src/lib/i18n/locale.ts`) reads the `egitimto_locale` cookie server-side; `localize(tr, en, locale)` (`src/lib/i18n/localize.ts`) picks a string. There are no `/en/...` routes. Switching locale is a Server Action (`src/lib/i18n/actions.ts`) that sets the cookie and redirects back to the current path (validated as same-origin-relative to avoid open redirect). Bilingual DB columns follow a strict `_tr`/`_en` suffix pair convention (e.g. `title_tr`/`title_en`) — there's no separate translations table.

**Content source split:** some public sections are hardcoded TypeScript data (`src/content/*.ts` — Alanlarımız, legal pages, contact info) because the spec explicitly decided they don't need a CMS; others read from Supabase tables and have full admin CRUD. Check the relevant spec in `docs/superpowers/specs/` before assuming a section should be either one.

**Supabase types**: `src/lib/supabase/database.types.ts` is generated (via Supabase MCP `generate_typescript_types` or `supabase gen types`) — don't hand-edit it. `src/lib/supabase/types.ts` derives app-facing types from it (e.g. `export type NewsItem = Tables<'news'>`).

**Migrations** in `supabase/migrations/` are applied via the Supabase MCP `apply_migration` tool (there's no local Supabase CLI/link in this environment) and mirrored into that directory afterward for history — they are not run automatically.
