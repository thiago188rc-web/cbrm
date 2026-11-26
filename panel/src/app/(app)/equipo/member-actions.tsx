"use client";

import { useActionState } from "react";
import { cambiarEstado, cambiarRol, linkRecuperacion, type LinkState } from "./actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { inputClass } from "@/components/ui/field";
import { ROLE_LABEL, type Role } from "@/lib/roles";
import { LinkResult } from "./link-result";

/* Acciones sobre un miembro. Solo se muestran si el servidor dijo que el
   usuario actual puede gestionarlo; igual cada acción lo vuelve a validar. */
export function MemberActions({
  id,
  role,
  active,
  rolesAsignables,
}: {
  id: string;
  role: Role;
  active: boolean;
  rolesAsignables: Role[];
}) {
  const [rolState, rolAction] = useActionState<LinkState, FormData>(cambiarRol, {});
  const [estState, estAction] = useActionState<LinkState, FormData>(cambiarEstado, {});
  const [recState, recAction] = useActionState<LinkState, FormData>(linkRecuperacion, {});
  const error = rolState.error || estState.error || recState.error;
  const ok = rolState.ok || estState.ok;

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {active && (
          <form action={rolAction} className="flex items-center gap-2">
            <input type="hidden" name="id" value={id} />
            <label className="sr-only" htmlFor={`rol-${id}`}>
              Rol
            </label>
            <select id={`rol-${id}`} name="role" defaultValue={role} className={`${inputClass} w-auto min-h-9 text-[13px]`}>
              {rolesAsignables.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
            <SubmitButton variant="secondary" pendingLabel="Guardando…" className="min-h-9">
              Cambiar rol
            </SubmitButton>
          </form>
        )}
        {active && (
          <form action={recAction}>
            <input type="hidden" name="id" value={id} />
            <SubmitButton variant="ghost" pendingLabel="Generando…" className="min-h-9">
              Link de contraseña
            </SubmitButton>
          </form>
        )}
        <form
          action={estAction}
          onSubmit={(e) => {
            if (active && !confirm("¿Dar de baja esta cuenta? Pierde el acceso al panel de inmediato.")) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="activar" value={active ? "0" : "1"} />
          <SubmitButton variant={active ? "danger" : "secondary"} pendingLabel="Guardando…" className="min-h-9">
            {active ? "Dar de baja" : "Reactivar"}
          </SubmitButton>
        </form>
      </div>
      {error && <p role="alert" className="text-[12.5px] text-err">{error}</p>}
      {ok && !error && <p role="status" className="text-[12.5px] text-ok">{ok}</p>}
      {recState.link && <LinkResult link={recState.link} para={recState.para} tipo="recovery" />}
    </div>
  );
}
