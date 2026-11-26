"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import { Field, FormMessage } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

export function LoginForm({ desde }: { desde?: string }) {
  const [state, action] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="grid gap-4" noValidate>
      {desde && <input type="hidden" name="desde" value={desde} />}
      <Field
        label="Mail"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.email}
        autoFocus
      />
      <Field label="Contraseña" name="password" type="password" autoComplete="current-password" required />
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      <SubmitButton pendingLabel="Entrando…" className="w-full min-h-11 mt-1">
        Entrar
      </SubmitButton>
    </form>
  );
}
