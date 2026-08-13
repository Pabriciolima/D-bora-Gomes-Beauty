"use strict";

/* =========================================================
   DÉBORA GOMES BEAUTY
   NOVO PROJETO SUPABASE
   ========================================================= */

const SUPABASE_URL =
  "https://psyirfduleuhzjqevrhm.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_P7NJLWkenDO6xS_IynPNtg_vAitIEOd";

if (!window.supabase) {
  throw new Error(
    "Biblioteca Supabase não carregada. Verifique o script do Supabase no index.html."
  );
}

if (
  !SUPABASE_URL.startsWith("https://") ||
  !SUPABASE_PUBLISHABLE_KEY.startsWith("sb_publishable_")
) {
  throw new Error(
    "URL ou Publishable Key do Supabase estão incorretas."
  );
}

window.dbClient = window.supabase.createClient(
  SUPABASE_URL,
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
  currency: "BRL",
  timezone: "America/Belem"
};

console.log("✅ Supabase conectado:", SUPABASE_URL);
console.log("✅ APP_CONFIG carregado:", window.APP_CONFIG);