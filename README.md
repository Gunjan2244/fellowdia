# Fellowdia (Next.js + Supabase)

Landing page, public fellowship feed, sign-in, saved list and an admin area. Next.js 15 App Router, server actions, `@supabase/ssr`.

## Setup
1. `npm install`
2. Create a Supabase project and run `supabase/migrations/0001_init.sql` in the SQL editor.
3. `cp .env.example .env.local` and fill in the URL and anon/publishable key.
4. Supabase Dashboard, Authentication, URL Configuration: set Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` to Redirect URLs (do the same for your production domain).
5. `npm run dev`, open http://localhost:3000, create an account on /sign-in, then make yourself admin in the SQL editor:
   `update public.profiles set role='admin' where id=(select id from auth.users where email='you@example.com');`
6. Sign out and back in; "Manage" appears in the header.

## Design system (app/globals.css)
One family (Bricolage Grotesque 400/700). Three sizes: 1rem, 1.6rem, 2.56rem, each 1.6x the last, with the root size fluid from 14px to 18px. One radius, one border weight, one spacing scale. Light and dark themes.

## Security
Authorization lives in Postgres RLS (see the migration). Server actions re-check admin status, but RLS is the real gate.

## Deploy
Import the repo into Vercel and set the three env vars (`NEXT_PUBLIC_SITE_URL` = your production URL).
