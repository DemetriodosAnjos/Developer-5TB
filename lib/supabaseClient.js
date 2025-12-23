// lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validação para evitar crash silencioso
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL ou Anon Key não configurados");
}

// Cliente público (frontend)
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

// Cliente admin (backend)
if (!supabaseServiceRoleKey) {
  console.warn("Service Role Key não configurada — supabaseAdmin indisponível");
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || ""
);
