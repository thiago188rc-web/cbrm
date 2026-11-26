import type { Role } from "@/lib/roles";

/* Módulos del panel. Solo aparecen los que ya funcionan: nada de botones
   sin destino. Cada etapa suma los suyos acá. */
export type NavItem = {
  href: string;
  label: string;
  icon: "equipo" | "actividad" | "cuenta";
  roles: readonly Role[];
};

export const NAV: NavItem[] = [
  { href: "/equipo", label: "Equipo", icon: "equipo", roles: ["nexa_admin", "rm_admin"] },
  { href: "/actividad", label: "Actividad", icon: "actividad", roles: ["nexa_admin", "rm_admin"] },
  { href: "/cuenta", label: "Mi cuenta", icon: "cuenta", roles: ["nexa_admin", "rm_admin", "rm_vendedor"] },
];

export const navFor = (role: Role) => NAV.filter((i) => i.roles.includes(role));

/* Pantalla de inicio de cada rol mientras no exista el dashboard (etapa 5). */
export const homeFor = (role: Role) => navFor(role)[0]?.href ?? "/cuenta";
