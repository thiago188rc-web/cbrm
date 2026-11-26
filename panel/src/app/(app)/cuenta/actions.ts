"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; ok?: string };

/* El nombre se guarda con la sesión del usuario: RLS y el GRANT por columna
   solo le permiten tocar su propio full_name. */
export async function guardarNombre(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = z.string().trim().min(2, "Escribí tu nombre.").max(120).safeParse(formData.get("full_name"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ full_name: parsed.data }).eq("id", user.id);
  if (error) return { error: "No se pudo guardar. Probá de nuevo." };
  revalidatePath("/", "layout");
  return { ok: "Nombre guardado." };
}

const passSchema = z
  .object({
    password: z
      .string()
      .min(10, "La contraseña necesita al menos 10 caracteres.")
      .max(72, "Máximo 72 caracteres."),
    confirmar: z.string(),
  })
  .refine((v) => v.password === v.confirmar, { message: "Las contraseñas no coinciden.", path: ["confirmar"] });

export async function cambiarPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = passSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return {
      error: /weak|pwned|leaked/i.test(error.message)
        ? "Esa contraseña es muy fácil de adivinar o apareció en filtraciones. Elegí otra."
        : /same/i.test(error.message)
          ? "Elegí una contraseña distinta a la anterior."
          : "No se pudo cambiar la contraseña. Probá de nuevo.",
    };
  }
  if (formData.get("seguir") === "1") redirect("/");
  return { ok: "Contraseña actualizada." };
}
