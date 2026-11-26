import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const base =
  "inline-flex items-center justify-center gap-2 min-h-10 px-4 rounded-[var(--radius)] text-[13px] font-semibold " +
  "transition-[background-color,border-color,color,opacity] duration-150 ease-[var(--ease-taller)] " +
  "disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  /* Amarillo = la acción principal de la pantalla. Una por vista. */
  primary: "bg-amber text-on-amber hover:bg-amber-hi",
  secondary: "border border-line-strong text-text hover:border-muted hover:bg-surface-2",
  ghost: "text-muted hover:text-text hover:bg-surface-2",
  danger: "border border-err/40 text-err hover:bg-err/10",
};

export function buttonClass(variant: Variant = "secondary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`;
}

export function Button({
  variant = "secondary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}
