/* Marca del panel: el logo de RM + "GROWTH OS" en Sora + la firma de NEXA. */
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.png" alt="" width={32} height={32} className="size-8 rounded-full shrink-0" />
      {!compact && (
        <div className="min-w-0 leading-none">
          <p className="display text-[15px] tracking-tight whitespace-nowrap">
            RM <span className="text-amber">GROWTH</span> OS
          </p>
          <p className="stamp text-[9px] mt-1">por NEXA</p>
        </div>
      )}
    </div>
  );
}
