import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_ROLES } from "@/lib/roles";
import { fechaHora } from "@/lib/format";
import { describir, ENTIDADES, type AuditRow } from "@/lib/audit-describe";
import { PageHeader } from "@/components/page-header";
import { buttonClass } from "@/components/ui/button";

export const metadata: Metadata = { title: "Actividad" };

const POR_PAGINA = 50;

export default async function ActividadPage({ searchParams }: PageProps<"/actividad">) {
  await requireRole(ADMIN_ROLES);
  const sp = await searchParams;
  const pagina = Math.max(1, Number.parseInt(String(sp.p ?? "1"), 10) || 1);
  const entidad = typeof sp.entidad === "string" && sp.entidad in ENTIDADES ? sp.entidad : null;

  const supabase = await createClient();
  let q = supabase
    .from("audit_log")
    .select("id, at, action, entity, entity_id, before, after, meta, actor:profiles(full_name, email)", {
      count: "exact",
    })
    .order("at", { ascending: false })
    .range((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA - 1);
  if (entidad) q = q.eq("entity", entidad);
  const { data, count, error } = await q;

  const total = count ?? 0;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const url = (p: number, e: string | null = entidad) =>
    `/actividad?${new URLSearchParams({ ...(e ? { entidad: e } : {}), ...(p > 1 ? { p: String(p) } : {}) })}`;

  return (
    <>
      <PageHeader kicker="Administración" title="Actividad">
        Todo cambio queda registrado con quién lo hizo y cuándo. No se puede editar ni borrar.
      </PageHeader>

      <div className="max-w-5xl grid gap-4">
        <nav aria-label="Filtrar por módulo" className="flex flex-wrap gap-2">
          <Link href={url(1, null)} aria-current={!entidad ? "page" : undefined} className={buttonClass(!entidad ? "secondary" : "ghost", "min-h-8 text-[12.5px]")}>
            Todo
          </Link>
          {Object.entries(ENTIDADES).map(([k, label]) => (
            <Link key={k} href={url(1, k)} aria-current={entidad === k ? "page" : undefined} className={buttonClass(entidad === k ? "secondary" : "ghost", "min-h-8 text-[12.5px]")}>
              {label}
            </Link>
          ))}
        </nav>

        {error ? (
          <p role="alert" className="text-err text-[13px]">No se pudo cargar la actividad. Recargá la página.</p>
        ) : !data?.length ? (
          <div className="border border-dashed border-line rounded-[var(--radius)] p-8 text-center">
            <p className="font-semibold">Todavía no hay actividad registrada</p>
            <p className="text-muted text-[13px] mt-1">Las invitaciones, cambios de rol y bajas van a aparecer acá.</p>
          </div>
        ) : (
          <ol className="border border-line rounded-[var(--radius)] divide-y divide-line bg-surface">
            {data.map((r) => {
              const actor = Array.isArray(r.actor) ? r.actor[0] : r.actor;
              return (
                <li key={r.id} className="grid gap-1 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-5 px-4 py-3">
                  <time dateTime={r.at} className="font-mono text-[11.5px] text-muted pt-0.5">
                    {fechaHora(r.at)}
                  </time>
                  <div className="min-w-0">
                    {describir(r as AuditRow).map((linea, i) => (
                      <p key={i} className="text-[13.5px]">{linea}</p>
                    ))}
                    <p className="stamp text-[9.5px] mt-1">
                      {actor ? actor.full_name || actor.email : "Sistema"} · {ENTIDADES[r.entity] ?? r.entity}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {paginas > 1 && (
          <nav aria-label="Páginas" className="flex items-center justify-between">
            <p className="stamp">Página {pagina} de {paginas}</p>
            <div className="flex gap-2">
              {pagina > 1 && <Link href={url(pagina - 1)} className={buttonClass("secondary", "min-h-9")}>Anterior</Link>}
              {pagina < paginas && <Link href={url(pagina + 1)} className={buttonClass("secondary", "min-h-9")}>Siguiente</Link>}
            </div>
          </nav>
        )}
      </div>
    </>
  );
}
