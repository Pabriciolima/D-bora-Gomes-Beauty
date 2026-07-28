"use strict";

const SUPABASE_PROJECT_URL =
  "https://agkhwjfcdhwkivulqjag.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_HpaVWrhP0W9R0iu9UjxgVw_QvqIF7_E";

if (!window.supabase) {
  throw new Error(
    "A biblioteca do Supabase não foi carregada."
  );
}

if (
  SUPABASE_PROJECT_URL.includes("COLE_AQUI") ||
  SUPABASE_PUBLISHABLE_KEY.includes("COLE_AQUI")
) {
  throw new Error(
    "Preencha a URL e a Publishable key no supabase-config.js."
  );
}

window.dbClient = window.supabase.createClient(
  SUPABASE_PROJECT_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

window.APP_CONFIG = {
  businessSlug: "debora-gomes-beauty",
  locale: "pt-BR",
  currency: "BRL"
};