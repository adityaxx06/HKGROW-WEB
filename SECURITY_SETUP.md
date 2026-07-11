# HK Grow Infra — Authentication & Security Setup Guide

## 1. Supabase Admin Account Setup

Complete these steps **before** deploying to production:

1. Open your Supabase project → **Authentication → Users → Invite User**
2. Enter `admin@hkgrowinfra.com` → Send invite
3. Admin receives email with a "Set your password" link (1-hour expiry)
4. Admin sets a strong password (16+ chars, mixed case + numbers + symbols)
5. Test login at `https://hkgrowinfra.com/admin/login`
6. **Do NOT create any other Supabase Auth users in V1**

> If the invite link expires before the admin sets a password, generate a new
> one from the Supabase dashboard: Authentication → Users → ⋯ → Send magic link.

---

## 2. Supabase Auth Settings (Dashboard → Auth → Settings)

| Setting | Value | Reason |
|---|---|---|
| Enable email confirmations | OFF | Single known admin — no need |
| Enable email change confirmations | ON | Security |
| Minimum password length | 12 | Baseline |
| JWT expiry | 3600 (1 hour) | Short-lived; Supabase auto-refreshes |
| Enable sign-ups | **OFF** | No new user registrations allowed |
| Site URL | `https://hkgrowinfra.com` | For auth redirects |
| Redirect URLs | `https://hkgrowinfra.com/admin` | Post-login destination |

**Disabling sign-ups is critical** — prevents anyone from creating an account
via the Supabase Auth API even if they discover the anon key.

---

## 3. Environment Variables

### Vercel Production Environment
```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key from Project Settings > API>
VITE_SITE_URL=https://hkgrowinfra.com
VITE_GA4_ID=G-XXXXXXXXXX
VITE_WHATSAPP_NUMBER=919876543210
```

### Vercel Preview Environment
```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co   (same project)
VITE_SUPABASE_ANON_KEY=<same anon key>
VITE_SITE_URL=https://hkgrowinfra-git-main-yourusername.vercel.app
```

### Supabase Edge Function Secrets (NOT in Vercel)
```
SUPABASE_SERVICE_ROLE_KEY=<service role key — NEVER in frontend>
RESEND_API_KEY=<from resend.com>
ADMIN_ALERT_EMAIL=admin@hkgrowinfra.com
```

> The `VITE_SUPABASE_ANON_KEY` is safe to expose in the frontend bundle —
> this is Supabase's intended design. It provides no elevated access;
> RLS policies control what each role can do.
>
> The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS entirely. It must NEVER
> appear in any frontend file, `.env`, or Vercel frontend env var.

---

## 4. Migration Execution Order

Run migrations in the Supabase SQL Editor (or via `supabase db push`) in this order:

```
001_extensions_and_functions.sql
002_website_settings_and_content_blocks.sql
003_property_categories.sql
004_projects.sql
005_properties.sql
006_team_members.sql
007_events.sql
008_blog_posts.sql
009_leads.sql
010_testimonials.sql
011_legal_pages.sql
012_views.sql
013_storage_policies.sql
014_seed_data.sql
015_auth_and_security.sql   ← run AFTER 014
```

**Migration 015 must run after 014** — it fixes seeded data paths and drops
the unsafe `leads_public_insert` policy added in 009.

---

## 5. Security Checklist (Pre-Launch)

### Database
- [ ] Migration 015 applied (leads_public_insert dropped)
- [ ] Confirm `submit_lead` is the only write path to `leads` — test with Supabase API explorer: direct INSERT as anon should fail with RLS violation
- [ ] Admin-only views (`properties_admin`, `leads_with_details`, `admin_dashboard_stats`, `leads_source_analytics`) return empty/error for anon role
- [ ] `get_current_admin_email()` returns correct email when authenticated, null when anon

### Auth
- [ ] Sign-ups disabled in Supabase Auth settings
- [ ] Admin account created and login tested at `/admin/login`
- [ ] Idle timeout: verify admin is signed out after 30 minutes of no activity
- [ ] No other Supabase Auth users exist

### Frontend
- [ ] `SUPABASE_SERVICE_ROLE_KEY` does not appear anywhere in `src/` or Vercel frontend env vars
- [ ] All rich-text rendering uses `safeHtml()` from `src/lib/sanitise.ts`
- [ ] All lead forms include the honeypot field (hidden, name="website" or similar)
- [ ] `useLeadSubmit` hook used for all public form submissions (not direct supabase.from('leads').insert)

### Storage
- [ ] `documents` bucket is private — verify a direct public URL returns 404
- [ ] `media` and `site-assets` public URLs serve images correctly
- [ ] Admin can generate a signed URL for a brochure PDF from the admin panel

### Deployment
- [ ] `/admin` and `/admin/*` return 200 (rendered by React, not 404 from Vercel) — check `vercel.json` rewrites
- [ ] `robots.txt` disallows `/admin` and `/admin/*`
- [ ] HTTPS enforced on custom domain (automatic with Vercel)
- [ ] Vercel preview deployments restricted to team members only (Vercel project settings)

---

## 6. Vercel Configuration

Create `vercel.json` in the project root to ensure the SPA router works on all paths:

```json
{
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## 7. Post-Launch Monitoring

- **Lead email alerts:** Confirm `send-lead-email` Edge Function fires on new lead (Phase 5)
- **Supabase Free tier keep-alive:** GitHub Action pings the DB every 3 days (Phase 5)
- **Auth anomalies:** Check Supabase Dashboard → Auth → Logs weekly for unexpected sign-in attempts
- **RLS audit:** Monthly spot-check — query `leads` as anon via Supabase API explorer to confirm zero rows returned and no direct INSERT possible
