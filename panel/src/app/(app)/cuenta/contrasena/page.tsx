import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { PasswordForm } from "../forms";

export const metadata: Metadata = { title: "Crear contraseña" };

/* Destino del link de invitación o de recuperación: la sesión ya está
   abierta (la abrió /auth/confirm), falta elegir la contraseña. */
export default async function ContrasenaPage({ searchParams }: PageProps<"/cuenta/contrasena">) {
  const user = await requireUser();
  const motivo = (await searchParams).motivo;
  const invitacion = motivo === "invite";

  return (
    <>
      <PageHeader
        kicker={invitacion ? "Bienvenida" : "Contraseña"}
        title={invitacion ? `Hola${user.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}` : "Elegí una contraseña nueva"}
      >
        {invitacion
          ? "Creá tu contraseña para entrar a RM GROWTH OS de ahora en más con tu mail."
          : "Con esta contraseña vas a entrar de ahora en más."}
      </PageHeader>
      <section className="max-w-md border border-line rounded-[var(--radius)] bg-surface p-5">
        <PasswordForm seguir label={invitacion ? "Crear contraseña y entrar" : "Guardar y entrar"} />
      </section>
    </>
  );
}
