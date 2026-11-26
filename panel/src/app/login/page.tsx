import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, tieneSesionSinAcceso } from "@/lib/auth";
import { Brand } from "@/components/brand";
import { FormMessage } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { LoginForm } from "./login-form";
import { logout } from "./actions";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const desde = typeof sp.desde === "string" ? sp.desde : undefined;
  const linkVencido = sp.error === "link";

  if (await getCurrentUser()) redirect("/");
  const sinAcceso = await tieneSesionSinAcceso();

  return (
    <main className="min-h-dvh grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section className="flex flex-col justify-between px-6 py-8 sm:px-12 lg:px-16 lg:py-12">
        <Brand />
        <div className="w-full max-w-sm py-12">
          <p className="stamp text-amber">Acceso privado</p>
          <h1 className="display text-[34px] sm:text-[40px] mt-3">Entrá al tablero</h1>
          <p className="text-muted mt-3 mb-8 max-w-[34ch]">
            Consultas, ventas y comisiones de Cabinas Desarmables RM. Solo con invitación.
          </p>
          {linkVencido && (
            <div className="mb-5">
              <FormMessage tone="error">
                El link venció o ya se usó. Pedile a un administrador uno nuevo.
              </FormMessage>
            </div>
          )}
          {sinAcceso ? (
            <div className="grid gap-4">
              <FormMessage tone="error">
                Tu sesión es válida pero tu acceso al panel no está habilitado. Pedíselo a un
                administrador.
              </FormMessage>
              <form action={logout}>
                <SubmitButton variant="secondary" className="w-full">
                  Cerrar sesión
                </SubmitButton>
              </form>
            </div>
          ) : (
            <LoginForm desde={desde} />
          )}
          <p className="text-muted text-[12.5px] mt-6">
            ¿Olvidaste la contraseña? Pedile a un administrador un link para crear una nueva.
          </p>
        </div>
        <p className="stamp">Cabinas Desarmables RM · Puerto Gral. San Martín</p>
      </section>

      {/* La chapa trapezoidal: el único lugar del panel donde aparece. */}
      <aside aria-hidden className="relative hidden lg:block overflow-hidden border-l border-line chapa">
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-amber" />
      </aside>
    </main>
  );
}
