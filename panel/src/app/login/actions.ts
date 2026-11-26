"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string; email?: string };

const schema = z.object({
  email: z.email("Escribí un mail válido.").trim().toLowerCase(),
  password: z.string().min(1, "Escribí tu contraseña."),
  desde: z.string().optional(),
});

/* Solo rutas internas: evita que ?desde= mande a otro sitio. */
function destinoSeguro(desde?: string) {
  if (!desde || !desde.startsWith("/") || desde.startsWith("//") || desde.startsWith("/\\")) return "/";
  return desde;
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message, email: String(formData.get("email") ?? "") };
  }
  const { email, password, desde } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    /* Mismo mensaje para mail inexistente y contraseña mala: no se puede
       averiguar quién tiene cuenta. Supabase limita los intentos. */
    return { error: "Mail o contraseña incorrectos.", email };
  }

  const { data: perfil } = await supabase
    .from("profiles")
    .select("active")
    .eq("id", data.user.id)
    .maybeSingle();
  if (!perfil?.active) {
    await supabase.auth.signOut();
    return { error: "Tu acceso al panel no está habilitado. Pedíselo a un administrador.", email };
  }

  redirect(destinoSeguro(desde));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
