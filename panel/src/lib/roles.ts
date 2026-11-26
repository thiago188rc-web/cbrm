/* Roles y permisos. Sin "server-only": las etiquetas también se usan en la
   interfaz. Lo que autoriza de verdad es el servidor (lib/auth + estas
   funciones dentro de cada Server Action) y RLS en la base. */
export const ROLES = ["nexa_admin", "rm_admin", "rm_vendedor"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, string> = {
  nexa_admin: "NEXA · Administración",
  rm_admin: "RM · Administración",
  rm_vendedor: "RM · Ventas",
};

export const ROLE_SHORT: Record<Role, string> = {
  nexa_admin: "NEXA",
  rm_admin: "RM admin",
  rm_vendedor: "RM ventas",
};

export const ADMIN_ROLES = ["nexa_admin", "rm_admin"] as const satisfies readonly Role[];

export const isAdmin = (r: Role) => (ADMIN_ROLES as readonly Role[]).includes(r);

/* Qué roles puede dar (invitar o asignar) cada uno.
   NEXA administra la herramienta: puede dar cualquier rol.
   RM administra a su equipo: no puede crear ni tocar cuentas de NEXA. */
export function rolesQuePuedeAsignar(actor: Role): Role[] {
  if (actor === "nexa_admin") return [...ROLES];
  if (actor === "rm_admin") return ["rm_admin", "rm_vendedor"];
  return [];
}

export const puedeGestionar = (actor: Role, objetivo: Role) =>
  rolesQuePuedeAsignar(actor).includes(objetivo);
