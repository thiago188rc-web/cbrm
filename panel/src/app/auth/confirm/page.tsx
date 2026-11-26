import type { Metadata } from "next";
import { Brand } from "@/components/brand";
import { SubmitButton } from "@/components/ui/submit-button";
import { aceptar } from "./actions";

export const metadata: Metadata = { title: "Aceptar acceso" };

export default async function ConfirmPage({ searchParams }: PageProps<"/auth/confirm">) {
  const sp = await searchParams;
  const tokenHash = typeof sp.token_hash === "string" ? sp.token_hash : "";
  const type = sp.type === "recovery" ? "recovery" : sp.type === "invite" ? "invite" : null;
  const valido = Boolean(tokenHash && type);

  return (
    <main className="min-h-dvh flex flex-col px-6 py-8 sm:px-12">
      <Brand />
      <div className="flex-1 grid place-items-center">
        <div className="w-full max-w-sm">
          {valido ? (
            <>
              <p className="stamp text-amber">{type === "invite" ? "Invitación" : "Nueva contraseña"}</p>
              <h1 className="display text-[30px] mt-3">
                {type === "invite" ? "Te invitaron a RM GROWTH OS" : "Creá una contraseña nueva"}
              </h1>
              <p className="text-muted mt-3 mb-8">
                {type === "invite"
                  ? "Aceptá para crear tu contraseña y entrar al panel. El link sirve una sola vez."
                  : "Continuá para elegir una contraseña nueva. El link sirve una sola vez."}
              </p>
              <form action={aceptar}>
                <input type="hidden" name="token_hash" value={tokenHash} />
                <input type="hidden" name="type" value={type!} />
                <SubmitButton pendingLabel="Verificando…" className="w-full min-h-11">
                  {type === "invite" ? "Aceptar invitación" : "Continuar"}
                </SubmitButton>
              </form>
            </>
          ) : (
            <>
              <h1 className="display text-[28px]">Este link no es válido</h1>
              <p className="text-muted mt-3">Pedile a un administrador un link nuevo.</p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
