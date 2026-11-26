import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/env";

/* Cliente con la clave secreta: saltea RLS. Solo para operaciones que el
   servidor ya autorizó (invitar, cambiar roles, dar de baja, auditoría).
   `server-only` hace fallar el build si alguien lo importa desde el cliente,
   y la variable no lleva NEXT_PUBLIC_, así que nunca viaja al navegador.

   `actorId` viaja en la cabecera x-actor-id: el trigger de auditoría la usa
   para registrar QUIÉN hizo el cambio aunque lo ejecute la clave secreta.
   La base solo la acepta en pedidos hechos con esa clave: un usuario común
   no puede hacerse pasar por otro. */
export function createAdminClient(actorId?: string) {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "Falta SUPABASE_SECRET_KEY (clave secreta de Supabase). Va en panel/.env.local y en Vercel, nunca en el repo.",
    );
  }
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: actorId ? { headers: { "x-actor-id": actorId } } : undefined,
  });
}

/* Acciones que no son un cambio de fila (por ejemplo, generar un link de
   invitación). Los cambios de fila ya los registra el trigger. */
export async function registrarAccion(
  actorId: string,
  action: string,
  entity: string,
  entityId: string | null,
  meta?: Record<string, unknown>,
) {
  const { error } = await createAdminClient(actorId)
    .from("audit_log")
    .insert({ actor_id: actorId, action, entity, entity_id: entityId, meta: meta ?? null });
  if (error) console.error("No se pudo registrar la acción en audit_log:", error.message);
}
