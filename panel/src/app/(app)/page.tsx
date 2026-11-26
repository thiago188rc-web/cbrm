import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { homeFor } from "@/lib/nav";

/* Hasta que exista el dashboard (etapa 5), el inicio lleva al primer módulo
   disponible para el rol. */
export default async function Home() {
  const user = await requireUser();
  redirect(homeFor(user.role));
}
