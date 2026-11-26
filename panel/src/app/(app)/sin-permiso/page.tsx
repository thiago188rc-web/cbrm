import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export const metadata: Metadata = { title: "Sin permiso" };

export default function SinPermiso() {
  return (
    <div className="max-w-md py-10">
      <p className="stamp text-amber">Acceso restringido</p>
      <h1 className="display text-[28px] mt-2">Esta sección no está habilitada para tu rol</h1>
      <p className="text-muted mt-3 mb-6">Si necesitás verla, pedíselo a un administrador.</p>
      <Link href="/" className={buttonClass("secondary")}>Volver al inicio</Link>
    </div>
  );
}
