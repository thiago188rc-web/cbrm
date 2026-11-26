"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole, type CurrentUser } from "@/lib/auth";
import { createAdminClient, registrarAccion } from "@/lib/supabase/admin";
import { ADMIN_ROLES, ROLES, puedeGestionar, type Role } from "@/lib/roles";
import { PANEL_URL } from "@/lib/env";

export type LinkState = { error?: string; link?: string; para?: string; ok?: string };

const linkDe = (hashed: string, type: "invite" | "recovery") =>
  `${PANEL_URL}/auth/confirm?token_hash=${encodeURIComponent(hashed)}&type=${type}`;

/* Trae el perfil objetivo y valida que el actor pueda gestionarlo.
   Toda la autorización pasa por acá, en el servidor. */
async function objetivo(actor: CurrentUser, id: string) {
  if (!z.uuid().safeParse(id).success) return { error: "Usuario inválido." } as const;
  const admin = createAdminClient(actor.id);
  const { data: p } = await admin
    .from("profiles")
    .select("id, email, full_name, role, active")
    .eq("id", id)
    .maybeSingle();
  if (!p) return { error: "Ese usuario no existe." } as const;
  if (!puedeGestionar(actor.role, p.role as Role)) {
    return { error: "No tenés permiso para gestionar esta cuenta." } as const;
  }
  return { p, admin } as const;
}

// ── Invitar ────────────────────────────────────────────────────────────
const invitarSchema = z.object({
  email: z.email("Escribí un mail válido.").trim().toLowerCase(),
  full_name: z.string().trim().min(2, "Escribí el nombre.").max(120),
  role: z.enum(ROLES, "Elegí un rol."),
});

export async function invitar(_prev: LinkState, formData: FormData): Promise<LinkState> {
  const actor = await requireRole(ADMIN_ROLES);
  const parsed = invitarSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { email, full_name, role } = parsed.data;
  if (!puedeGestionar(actor.role, role)) return { error: "No podés dar ese rol." };

  const admin = createAdminClient(actor.id);
  const { data, error } = await admin.auth.admin.generateLink({ type: "invite", email });
  if (error || !data?.user) {
    const existe = /already|registered|exists/i.test(error?.message ?? "");
    return {
      error: existe
        ? "Ese mail ya tiene cuenta. Si no puede entrar, generale un link de recuperación."
        : "No se pudo crear la invitación. Probá de nuevo.",
    };
  }

  const { error: perfilError } = await admin.from("profiles").insert({
    id: data.user.id,
    email,
    full_name,
    role,
    invited_by: actor.id,
  });
  if (perfilError) {
    /* Sin perfil la cuenta no sirve: se deshace para no dejar usuarios huérfanos. */
    await admin.auth.admin.deleteUser(data.user.id);
    return { error: "No se pudo crear el perfil. Probá de nuevo." };
  }

  await registrarAccion(actor.id, "member.invite_link", "profiles", data.user.id, { email, role });
  revalidatePath("/equipo");
  return { link: linkDe(data.properties.hashed_token, "invite"), para: full_name };
}

// ── Link para crear una contraseña nueva ──────────────────────────────
export async function linkRecuperacion(_prev: LinkState, formData: FormData): Promise<LinkState> {
  const actor = await requireRole(ADMIN_ROLES);
  const t = await objetivo(actor, String(formData.get("id") ?? ""));
  if ("error" in t) return { error: t.error };
  if (!t.p.active) return { error: "La cuenta está dada de baja. Reactivala primero." };

  const { data, error } = await t.admin.auth.admin.generateLink({ type: "recovery", email: t.p.email });
  if (error || !data?.properties) return { error: "No se pudo generar el link. Probá de nuevo." };

  await registrarAccion(actor.id, "member.recovery_link", "profiles", t.p.id, { email: t.p.email });
  return { link: linkDe(data.properties.hashed_token, "recovery"), para: t.p.full_name || t.p.email };
}

// ── Cambiar rol ────────────────────────────────────────────────────────
export async function cambiarRol(_prev: LinkState, formData: FormData): Promise<LinkState> {
  const actor = await requireRole(ADMIN_ROLES);
  const id = String(formData.get("id") ?? "");
  const nuevo = z.enum(ROLES).safeParse(formData.get("role"));
  if (!nuevo.success) return { error: "Rol inválido." };
  if (id === actor.id) return { error: "No podés cambiar tu propio rol." };

  const t = await objetivo(actor, id);
  if ("error" in t) return { error: t.error };
  if (!puedeGestionar(actor.role, nuevo.data)) return { error: "No podés dar ese rol." };
  if (t.p.role === nuevo.data) return {};

  const { error } = await t.admin.from("profiles").update({ role: nuevo.data }).eq("id", id);
  if (error) return { error: "No se pudo cambiar el rol." };
  revalidatePath("/equipo");
  return { ok: "Rol actualizado." };
}

// ── Dar de baja / reactivar ────────────────────────────────────────────
export async function cambiarEstado(_prev: LinkState, formData: FormData): Promise<LinkState> {
  const actor = await requireRole(ADMIN_ROLES);
  const id = String(formData.get("id") ?? "");
  const activar = formData.get("activar") === "1";
  if (id === actor.id) return { error: "No podés darte de baja a vos mismo." };

  const t = await objetivo(actor, id);
  if ("error" in t) return { error: t.error };

  /* La baja corta el acceso en dos niveles: el perfil inactivo deja sin
     datos (RLS) aunque el token siga vigente, y el bloqueo en Auth impide
     entrar o renovar la sesión. */
  const { error } = await t.admin.from("profiles").update({ active: activar }).eq("id", id);
  if (error) return { error: "No se pudo actualizar la cuenta." };
  const { error: banError } = await t.admin.auth.admin.updateUserById(id, {
    ban_duration: activar ? "none" : "876000h",
  });
  if (banError) {
    await t.admin.from("profiles").update({ active: !activar }).eq("id", id);
    return { error: "No se pudo actualizar el acceso. No se hizo ningún cambio." };
  }
  revalidatePath("/equipo");
  return { ok: activar ? "Cuenta reactivada." : "Cuenta dada de baja." };
}
