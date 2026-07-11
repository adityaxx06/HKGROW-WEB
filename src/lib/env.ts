/**
 * Centralised, validated access to Vite environment variables.
 *
 * Import `env` instead of using `import.meta.env` directly anywhere else
 * in the app. This fails fast (with a clear error) at startup if a
 * required variable is missing, rather than failing silently later with
 * a confusing Supabase/network error.
 */

interface AppEnv {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SITE_URL: string;
  GA4_ID?: string;
  WHATSAPP_NUMBER?: string;
}

function readEnv(key: string, required = true): string {
  const value = import.meta.env[`VITE_${key}`] as string | undefined;

  if (required && (!value || value.trim() === '')) {
    throw new Error(
      `Missing required environment variable: VITE_${key}. ` +
        `Check your .env file (see .env.example) or your Vercel project settings.`
    );
  }

  return value ?? '';
}

export const env: AppEnv = {
  SUPABASE_URL: readEnv('SUPABASE_URL'),
  SUPABASE_ANON_KEY: readEnv('SUPABASE_ANON_KEY'),
  SITE_URL: readEnv('SITE_URL'),
  GA4_ID: readEnv('GA4_ID', false) || undefined,
  WHATSAPP_NUMBER: readEnv('WHATSAPP_NUMBER', false) || undefined,
};
