import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

export const inputClass =
  "w-full min-h-10 px-3 rounded-[var(--radius)] bg-surface-2 border border-line text-text text-[14px] " +
  "placeholder:text-muted/70 transition-colors duration-150 " +
  "hover:border-line-strong focus:border-amber focus:outline-none aria-[invalid=true]:border-err";

export function Field({
  label,
  name,
  error,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  error?: string;
  hint?: string;
}) {
  const id = props.id ?? `f-${name}`;
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="stamp">
        {label}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={inputClass}
        {...props}
      />
      {error ? (
        <p id={`${id}-err`} className="text-[12.5px] text-err">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[12.5px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function SelectField({
  label,
  name,
  error,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; name: string; error?: string }) {
  const id = props.id ?? `f-${name}`;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="stamp">
        {label}
      </label>
      <select
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`${inputClass} appearance-none bg-[length:10px] bg-no-repeat bg-[right_12px_center] pr-8`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239A9C94'/%3E%3C/svg%3E\")",
        }}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={`${id}-err`} className="text-[12.5px] text-err">
          {error}
        </p>
      )}
    </div>
  );
}

/* Mensaje de resultado de un formulario (error general o confirmación). */
export function FormMessage({ tone, children }: { tone: "error" | "ok"; children: React.ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`text-[13px] px-3 py-2 rounded-[var(--radius)] border ${
        tone === "error" ? "border-err/40 text-err bg-err/5" : "border-ok/30 text-ok bg-ok/5"
      }`}
    >
      {children}
    </p>
  );
}
