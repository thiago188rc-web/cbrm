/* Variables públicas (viajan al navegador). La clave secreta NO está acá:
   vive solo en src/lib/supabase/admin.ts, que es server-only. */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Copiá panel/.env.example a panel/.env.local y completala.`,
    );
  }
  return value;
}

export const SUPABASE_URL = required(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);

export const SUPABASE_PUBLISHABLE_KEY = required(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

/* Origen público del panel: arma los links de invitación y recuperación. */
export const PANEL_URL = (
  process.env.NEXT_PUBLIC_PANEL_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");
