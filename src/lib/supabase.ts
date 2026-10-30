import { createClient } from "@supabase/supabase-js";

// Production fallback credentials for public client guestbook
// (Supabase publishable anon keys are safe for client-side public queries with RLS)
const DEFAULT_SUPABASE_URL = "https://sqqpvfxvhosuvitrkyig.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_Carfh6ZCoOHjHSlFARnvsg_D2WsDA50";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("placeholder")
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface RealGuestbookEntry {
  id: string;
  author: string;
  message: string;
  created_at: string;
}
