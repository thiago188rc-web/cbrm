/* Encabezado de pantalla: etiqueta estampada + título en Sora + bajada. */
export function PageHeader({
  kicker,
  title,
  children,
  actions,
}: {
  kicker: string;
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div className="min-w-0">
        <p className="stamp text-amber">{kicker}</p>
        <h1 className="display text-[28px] sm:text-[34px] mt-2">{title}</h1>
        {children && <p className="text-muted mt-2 max-w-[60ch]">{children}</p>}
      </div>
      {actions}
    </header>
  );
}
