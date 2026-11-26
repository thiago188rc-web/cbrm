"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui/button";

/* Link de un solo uso para pasar a la persona. Se muestra una vez: no queda
   guardado en ningún lado del panel. */
export function LinkResult({ link, para, tipo }: { link: string; para?: string; tipo: "invite" | "recovery" }) {
  const [copiado, setCopiado] = useState(false);
  const texto =
    tipo === "invite"
      ? `Hola${para ? ` ${para}` : ""}, te invito a RM GROWTH OS, el panel comercial de Cabinas Desarmables RM. Entrá con este link para crear tu contraseña (sirve una sola vez): ${link}`
      : `Hola${para ? ` ${para}` : ""}, este es tu link para crear una contraseña nueva en RM GROWTH OS (sirve una sola vez): ${link}`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div className="grid gap-3 border border-line border-l-2 border-l-amber rounded-[var(--radius)] bg-surface-2 p-4">
      <p className="text-[13px]">
        {tipo === "invite" ? "Invitación lista" : "Link de recuperación listo"}
        {para ? ` para ${para}` : ""}. Pasáselo por un canal privado: sirve una sola vez y vence.
      </p>
      <code className="block font-mono text-[11.5px] text-muted break-all select-all">{link}</code>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={copiar} className={buttonClass("secondary")}>
          {copiado ? "Copiado ✓" : "Copiar link"}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(texto)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass("ghost")}
        >
          Mandar por WhatsApp
        </a>
      </div>
    </div>
  );
}
