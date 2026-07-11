/**
 * Error handling strategy.
 *
 * All errors from Supabase, the service layer, and mutations are normalised
 * through this module before surfacing to the UI.
 *
 * Three categories:
 *   1. Network / fetch errors — show generic "connection" message
 *   2. Supabase DB errors (PostgrestError) — map known codes to friendly messages
 *   3. Application errors (thrown strings prefixed with 'VALIDATION_ERROR:' etc.)
 *      — strip the prefix and show directly
 */

interface PostgrestError {
  code: string;
  message: string;
  details: string | null;
  hint: string | null;
}

function isPostgrestError(err: unknown): err is PostgrestError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    'message' in err
  );
}

/** Map PostgreSQL/Supabase error codes to user-friendly messages */
const POSTGREST_MESSAGES: Record<string, string> = {
  '23505': 'A record with this value already exists.',
  '23503': 'This record is linked to other data and cannot be deleted.',
  '23514': 'The value provided is not valid for this field.',
  '42501': 'You do not have permission to perform this action.',
  'PGRST116': 'The requested record was not found.',
  'PGRST301': 'Your session has expired. Please sign in again.',
};

/**
 * Normalise any caught error into a plain string suitable for display.
 * Never throws — always returns a non-empty string.
 */
export function normaliseError(err: unknown): string {
  if (!err) return 'An unknown error occurred.';

  // Application-level prefixed errors (from submit_lead, etc.)
  if (typeof err === 'string') {
    return err.replace(/^(VALIDATION_ERROR|DUPLICATE_ERROR|APPLICATION_ERROR):\s*/i, '').trim()
      || 'An unexpected error occurred.';
  }

  // PostgrestError from Supabase
  if (isPostgrestError(err)) {
    return POSTGREST_MESSAGES[err.code] ?? err.message ?? 'A database error occurred.';
  }

  // Standard JS Error
  if (err instanceof Error) {
    // Prefixed errors surfaced through RPC exceptions
    const msg = err.message.replace(/^(VALIDATION_ERROR|DUPLICATE_ERROR):\s*/i, '').trim();
    return msg || 'An unexpected error occurred.';
  }

  return 'An unexpected error occurred.';
}

/**
 * Returns true if the error indicates the Supabase session has expired.
 * Used by the query client's error handler to trigger a sign-out.
 */
export function isAuthError(err: unknown): boolean {
  if (isPostgrestError(err)) return err.code === 'PGRST301' || err.code === '42501';
  if (err instanceof Error) return err.message.toLowerCase().includes('jwt expired');
  return false;
}
