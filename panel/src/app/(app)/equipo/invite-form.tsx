"use client";

import { useActionState, useEffect, useRef } from "react";
import { invitar, type LinkState } from "./actions";
import { Field, FormMessage, SelectField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { ROLE_LABEL, type Role } from "@/lib/roles";
import { LinkResult } from "./link-result";

export function InviteForm({ roles }: { roles: Role[] }) {
  const [state, action] = useActionState<LinkState, FormData>(invitar, {});
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.link) form.current?.reset();
  }, [state.link]);

  return (
    <section aria-labelledby="invitar-t" className="border border-line rounded-[var(--radius)] bg-surface p-5 grid gap-5">
      <div>
        <h2 id="invitar-t" className="text-[15px] font-semibold">
          Invitar a alguien
        </h2>
        <p className="text-muted text-[13px] mt-1">
          Se genera un link de un solo uso para que la persona cree su contraseña.
        </p>
      </div>
      <form ref={form} action={action} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Field label="Nombre" name="full_name" autoComplete="off" required maxLength={120} />
        <Field label="Mail" name="email" type="email" inputMode="email" autoComplete="off" required />
        <SelectField label="Rol" name="role" defaultValue="" required>
          <option value="" disabled>
            Elegí un rol
          </option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r]}
            </option>
          ))}
        </SelectField>
        <div className="flex items-end">
          <SubmitButton pendingLabel="Generando…" className="w-full sm:w-auto">
            Generar invitación
          </SubmitButton>
        </div>
      </form>
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      {state.link && <LinkResult link={state.link} para={state.para} tipo="invite" />}
    </section>
  );
}
