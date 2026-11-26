"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, UserRound, UsersRound, type LucideIcon } from "lucide-react";
import type { NavItem } from "@/lib/nav";

const ICONS: Record<NavItem["icon"], LucideIcon> = {
  equipo: UsersRound,
  actividad: History,
  cuenta: UserRound,
};

const activo = (path: string, href: string) => path === href || path.startsWith(href + "/");

/* Escritorio: barra lateral. La estación actual lleva la franja amarilla a
   la izquierda, como la franja del piso del taller. */
export function SideNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <nav aria-label="Módulos" className="grid gap-0.5">
      {items.map((it) => {
        const Icon = ICONS[it.icon];
        const on = activo(path, it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={on ? "page" : undefined}
            className={`relative flex items-center gap-3 h-10 pl-4 pr-3 rounded-[var(--radius)] text-[13.5px] transition-colors duration-150 ${
              on ? "bg-surface-2 text-text" : "text-muted hover:text-text hover:bg-surface-2/60"
            }`}
          >
            <span
              aria-hidden
              className={`absolute left-0 top-2 bottom-2 w-[2px] rounded-full transition-colors duration-150 ${
                on ? "bg-amber" : "bg-transparent"
              }`}
            />
            <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

/* Celular: barra inferior fija, al alcance del pulgar. */
export function BottomNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <nav
      aria-label="Módulos"
      className="lg:hidden fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((it) => {
          const Icon = ICONS[it.icon];
          const on = activo(path, it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={on ? "page" : undefined}
                className={`relative flex flex-col items-center justify-center gap-1 h-14 text-[11px] ${
                  on ? "text-text" : "text-muted"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute top-0 inset-x-6 h-[2px] ${on ? "bg-amber" : "bg-transparent"}`}
                />
                <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
