import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_ROLES, ROLE_LABEL, puedeGestionar, rolesQuePuedeAsignar, type Role } from "@/lib/roles";
import { fecha, fechaHora } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { InviteForm } from "./invite-form";
import { MemberActions } from "./member-actions";

export const metadata: Metadata = { title: "Equipo" };

type Estado = "activo" | "pendiente" | "baja";
const ESTADO: Record<Estado, { label: string; cls: string }> = {
  activo: { label: "Activo", cls: "text-ok" },
  pendiente: { label: "Invitación pendiente", cls: "text-amber" },
  baja: { label: "Dado de baja", cls: "text-muted" },
};

export default async function EquipoPage() {
  const actor = await requireRole(ADMIN_ROLES);
  const supabase = await createClient();

  /* El equipo se lee con la sesión del usuario (pasa por RLS). Auth solo
     aporta el estado de la invitación y el último ingreso. */
  const [{ data: perfiles, error }, auth] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name, role, active, created_at").order("created_at"),
    createAdminClient().auth.admin.listUsers({ page: 1, perPage: 200 }),
  ]);
  const authPorId = new Map((auth.data?.users ?? []).map((u) => [u.id, u]));
  const asignables = rolesQuePuedeAsignar(actor.role);

  const miembros = (perfiles ?? []).map((p) => {
    const u = authPorId.get(p.id);
    const estado: Estado = !p.active ? "baja" : u && !u.last_sign_in_at ? "pendiente" : "activo";
    return { ...p, role: p.role as Role, estado, ultimo: u?.last_sign_in_at ?? null };
  });

  return (
    <>
      <PageHeader kicker="Administración" title="Equipo">
        Quién tiene acceso al panel y con qué rol. RM gestiona a su equipo; las cuentas de NEXA las gestiona
        NEXA.
      </PageHeader>

      <div className="grid gap-8 max-w-5xl">
        <InviteForm roles={asignables} />

        <section aria-labelledby="miembros-t">
          <div className="flex items-baseline justify-between mb-3">
            <h2 id="miembros-t" className="text-[15px] font-semibold">
              Miembros
            </h2>
            <p className="stamp">{miembros.length} en total</p>
          </div>

          {error ? (
            <p role="alert" className="text-err text-[13px]">
              No se pudo cargar el equipo. Recargá la página.
            </p>
          ) : (
            <ul className="border border-line rounded-[var(--radius)] divide-y divide-line bg-surface">
              {miembros.map((m) => {
                const yo = m.id === actor.id;
                const gestionable = !yo && puedeGestionar(actor.role, m.role);
                return (
                  <li key={m.id} className="p-4 sm:p-5 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
                    <div className="min-w-0 grid gap-1.5">
                      <p className="font-semibold truncate">
                        {m.full_name || m.email}
                        {yo && <span className="stamp ml-2 text-amber">vos</span>}
                      </p>
                      <p className="text-muted text-[13px] truncate">{m.email}</p>
                      <dl className="flex flex-wrap gap-x-5 gap-y-1 mt-1">
                        <div className="flex gap-1.5">
                          <dt className="stamp">Rol</dt>
                          <dd className="text-[12.5px]">{ROLE_LABEL[m.role]}</dd>
                        </div>
                        <div className="flex gap-1.5">
                          <dt className="stamp">Estado</dt>
                          <dd className={`text-[12.5px] ${ESTADO[m.estado].cls}`}>{ESTADO[m.estado].label}</dd>
                        </div>
                        <div className="flex gap-1.5">
                          <dt className="stamp">Alta</dt>
                          <dd className="text-[12.5px] font-mono">{fecha(m.created_at)}</dd>
                        </div>
                        <div className="flex gap-1.5">
                          <dt className="stamp">Último ingreso</dt>
                          <dd className="text-[12.5px] font-mono">{fechaHora(m.ultimo)}</dd>
                        </div>
                      </dl>
                    </div>
                    {gestionable ? (
                      <MemberActions id={m.id} role={m.role} active={m.active} rolesAsignables={asignables} />
                    ) : (
                      <p className="text-muted text-[12.5px] lg:text-right">
                        {yo ? "Tu cuenta se edita en Mi cuenta." : "La gestiona NEXA."}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
