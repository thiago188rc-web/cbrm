"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  token_hash: z.string().min(10).max(200),
  type: z.enum(["invite", "recovery"]),
});

/* Valida el token de un solo uso y abre la sesión. Corre solo cuando la
   persona toca el botón (POST): las vistas previas de WhatsApp hacen GET y
   no lo consumen. */
export async function aceptar(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/login?error=link");

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type: parsed.data.type,
    token_hash: parsed.data.token_hash,
  });
  if (error) redirect("/login?error=link");

  redirect(`/cuenta/contrasena?motivo=${parsed.data.type}`);
}
