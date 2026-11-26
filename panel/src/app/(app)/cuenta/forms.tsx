"use client";

import { useActionState } from "react";
import { cambiarPassword, guardarNombre, type FormState } from "./actions";
import { Field, FormMessage } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

export function NombreForm({ actual }: { actual: string }) {
  const [state, action] = useActionState<FormState, FormData>(guardarNombre, {});
  return (
    <form action={action} className="grid gap-4" noValidate>
      <Field label="Nombre" name="full_name" defaultValue={actual} autoComplete="name" required maxLength={120} />
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      {state.ok && <FormMessage tone="ok">{state.ok}</FormMessage>}
      <div>
        <SubmitButton variant="secondary" pendingLabel="Guardando…">
          Guardar nombre
        </SubmitButton>
      </div>
    </form>
  );
}

export function PasswordForm({ seguir = false, label = "Cambiar contraseña" }: { seguir?: boolean; label?: string }) {
  const [state, action] = useActionState<FormState, FormData>(cambiarPassword, {});
  return (
    <form action={action} className="grid gap-4" noValidate>
      {seguir && <input type="hidden" name="seguir" value="1" />}
      <Field
        label="Contraseña nueva"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={10}
        hint="Al menos 10 caracteres. Mejor una frase que una palabra."
      />
      <Field label="Repetila" name="confirmar" type="password" autoComplete="new-password" required />
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      {state.ok && <FormMessage tone="ok">{state.ok}</FormMessage>}
      <div>
        <SubmitButton variant={seguir ? "primary" : "secondary"} pendingLabel="Guardando…">
          {label}
        </SubmitButton>
      </div>
    </form>
  );
}
