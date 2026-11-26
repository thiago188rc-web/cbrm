import { ROLE_LABEL, type Role } from "@/lib/roles";

/* Traduce una fila de audit_log a una frase. Cada etapa suma sus entidades
   acá; lo que no se reconoce cae en una descripción genérica, nunca se oculta. */
export type AuditRow = {
  action: string;
  entity: string;
  entity_id: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  meta: Record<string, unknown> | null;
};

const nombre = (r: Record<string, unknown> | null) =>
  String(r?.full_name || r?.email || "un usuario");
const rol = (v: unknown) => ROLE_LABEL[v as Role] ?? String(v);

export function describir(row: AuditRow): string[] {
  const { action, entity, before, after, meta } = row;

  if (action === "member.invite_link") return [`Generó una invitación para ${meta?.email} (${rol(meta?.role)})`];
  if (action === "member.recovery_link") return [`Generó un link de contraseña para ${meta?.email}`];

  if (entity === "profiles") {
    if (action === "insert") return [`Alta de ${nombre(after)} como ${rol(after?.role)}`];
    if (action === "delete") return [`Eliminó la cuenta de ${nombre(before)}`];
    if (action === "update" && before && after) {
      const cambios: string[] = [];
      if (before.role !== after.role) cambios.push(`Cambió el rol de ${nombre(after)}: ${rol(before.role)} → ${rol(after.role)}`);
      if (before.active !== after.active) cambios.push(after.active ? `Reactivó a ${nombre(after)}` : `Dio de baja a ${nombre(after)}`);
      if (before.full_name !== after.full_name) cambios.push(`Nombre: "${before.full_name || "—"}" → "${after.full_name}"`);
      return cambios.length ? cambios : [`Actualizó la cuenta de ${nombre(after)}`];
    }
  }

  return [`${action} · ${entity}${row.entity_id ? ` · ${row.entity_id}` : ""}`];
}

export const ENTIDADES: Record<string, string> = {
  profiles: "Equipo",
};
