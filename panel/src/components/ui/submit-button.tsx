"use client";

import { useFormStatus } from "react-dom";
import { buttonClass } from "./button";

/* Botón de envío: se deshabilita mientras la acción corre, así un doble
   clic no manda dos veces. */
export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={buttonClass(variant, className)}
    >
      {pending && (
        <span
          aria-hidden
          className="size-3.5 rounded-full border-2 border-current border-r-transparent animate-spin"
        />
      )}
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}
