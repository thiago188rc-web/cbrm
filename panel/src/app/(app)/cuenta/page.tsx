import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/roles";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/ui/submit-button";
import { logout } from "@/app/login/actions";
import { NombreForm, PasswordForm } from "./forms";

export const metadata: Metadata = { title: "Mi cuenta" };

export default async function CuentaPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader kicker="Mi cuenta" title={user.fullName || "Tu cuenta"} />
      <div className="grid gap-6 max-w-xl">
        <section className="border border-line rounded-[var(--radius)] bg-surface p-5 grid gap-4">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="stamp">Mail</dt>
              <dd className="mt-1 break-all">{user.email}</dd>
            </div>
            <div>
              <dt className="stamp">Rol</dt>
              <dd className="mt-1">{ROLE_LABEL[user.role]}</dd>
            </div>
          </dl>
          <p className="text-muted text-[12.5px]">El mail y el rol los cambia un administrador.</p>
        </section>

        <section aria-labelledby="nombre-t" className="border border-line rounded-[var(--radius)] bg-surface p-5 grid gap-4">
          <h2 id="nombre-t" className="text-[15px] font-semibold">Nombre</h2>
          <NombreForm actual={user.fullName} />
        </section>

        <section aria-labelledby="pass-t" className="border border-line rounded-[var(--radius)] bg-surface p-5 grid gap-4">
          <h2 id="pass-t" className="text-[15px] font-semibold">Contraseña</h2>
          <PasswordForm />
        </section>

        <form action={logout} className="lg:hidden">
          <SubmitButton variant="secondary" className="w-full">Cerrar sesión</SubmitButton>
        </form>
      </div>
    </>
  );
}
