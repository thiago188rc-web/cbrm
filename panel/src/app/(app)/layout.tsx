import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { navFor } from "@/lib/nav";
import { ROLE_SHORT } from "@/lib/roles";
import { Brand } from "@/components/brand";
import { SideNav, BottomNav } from "@/components/shell/nav";
import { logout } from "@/app/login/actions";

/* Todo lo que está dentro de (app) exige sesión y perfil activo. El proxy ya
   filtró a quien no tiene sesión; esto lo verifica de nuevo contra la base. */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const items = navFor(user.role);
  const nombre = user.fullName || user.email;

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="hidden lg:flex flex-col gap-8 sticky top-0 h-dvh border-r border-line bg-surface px-3 py-5">
        <div className="px-2">
          <Brand />
        </div>
        <SideNav items={items} />
        <div className="mt-auto px-2 grid gap-3">
          <div className="min-w-0">
            <p className="text-[13px] truncate">{nombre}</p>
            <p className="stamp text-[9.5px] mt-0.5">{ROLE_SHORT[user.role]}</p>
          </div>
          <form action={logout}>
            <button type="submit" className="text-[12.5px] text-muted hover:text-text transition-colors">
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b border-line bg-bg/95 backdrop-blur-sm">
        <Brand />
        <Link href="/cuenta" className="stamp text-[9.5px] truncate max-w-[40vw]">
          {ROLE_SHORT[user.role]}
        </Link>
      </header>

      <main className="min-w-0 px-4 sm:px-8 lg:px-10 pt-6 lg:pt-9 pb-24 lg:pb-12">{children}</main>
      <BottomNav items={items} />
    </div>
  );
}
