import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/env";

/* Cliente de Supabase con la sesión del usuario: todo lo que lee o escribe
   pasa por RLS. Uno nuevo por request (la librería lo exige para que las
   cabeceras de no-caché salgan con la primera escritura de cookies). */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* Un Server Component no puede escribir cookies. No pasa nada: el
             proxy refresca la sesión en cada request. En Server Actions y
             Route Handlers sí se escriben. */
        }
      },
    },
  });
}
