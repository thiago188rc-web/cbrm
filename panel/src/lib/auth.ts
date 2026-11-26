import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/roles";

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
};

/* Capa de acceso: la única forma de saber quién está pidiendo algo.
   1. getClaims() verifica la firma del token (no confía en la cookie).
   2. El rol sale de la tabla profiles (nunca de user_metadata, que el
      usuario puede editar), y solo si el perfil está activo.
   cache() evita repetir la consulta dentro del mismo request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  if (error || !sub) return null;

  const { data: perfil } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, active")
    .eq("id", sub)
    .maybeSingle();

  if (!perfil || !perfil.active) return null;
  return {
    id: perfil.id,
    email: perfil.email,
    fullName: perfil.full_name,
    role: perfil.role as Role,
  };
});

/* Hay sesión válida pero el perfil no existe o está dado de baja. */
export const tieneSesionSinAcceso = cache(async (): Promise<boolean> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) return false;
  return (await getCurrentUser()) === null;
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?estado=sin-acceso");
  return user;
}

export async function requireRole(roles: readonly Role[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/sin-permiso");
  return user;
}
