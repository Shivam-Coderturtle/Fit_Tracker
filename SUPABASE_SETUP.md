# Supabase setup (one-time)

Your app credentials are in `.env`. Before sign-up works, run the database schema:

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project **zbtsnjhhpullwekejkox**
2. Go to **SQL Editor** → **New query**
3. Open `supabase/schema.sql` in your editor, select **all** (Cmd+A), copy
4. Paste into SQL Editor (must start with `create table`, not `-` or `--`)
5. Click **Run**

If you see `syntax error at or near "-"`, you pasted a comment line wrong. Use the file from the repo with no leading `-` lines.

Also confirm in **Authentication → Providers → Email**:

- **Enable Email provider** — ON
- **Confirm email** — OFF (as you requested)

## What gets created

| Object | Purpose |
|--------|---------|
| `profiles` | Unique username per user |
| `daily_entries` | Weight + diet per day |
| `is_username_available()` | Check username before sign-up |
| RLS policies | Users only see their own data |

## Auth note

Login uses **username + password** in the UI. Supabase stores auth as `username@fittrack.app` internally (you never type that email).
