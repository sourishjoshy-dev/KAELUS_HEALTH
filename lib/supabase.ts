import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  // Warn at module load time so it's obvious during dev
  console.warn(
    "[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "File uploads will be skipped. Add these to your .env.local."
  );
}

/**
 * Server-only Supabase client using the service role key.
 * Do NOT expose this client to the browser — it bypasses RLS.
 */
export const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      })
    : null;

/** Name of the Supabase Storage bucket for medical reports */
export const MEDICAL_REPORTS_BUCKET = "medical-reports";
