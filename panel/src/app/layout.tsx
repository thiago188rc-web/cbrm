import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

/* Las tres familias de RM (ver DESIGN.md): mismos archivos variables que la
   web pública, servidos desde el panel. */
const archivo = localFont({
  src: "./fonts/archivo-v25-latin.woff2",
  variable: "--font-archivo",
  weight: "380 850",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "100% 125%" }],
});
const sora = localFont({
  src: "./fonts/sora-v17-latin.woff2",
  variable: "--font-sora",
  weight: "600 800",
  display: "swap",
});
const azeret = localFont({
  src: "./fonts/azeretmono-v21-latin.woff2",
  variable: "--font-azeret",
  weight: "400 500",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "RM GROWTH OS", template: "%s · RM GROWTH OS" },
  description: "Gestión comercial de Cabinas Desarmables RM. Desarrollado por NEXA.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0B0C0D",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={`${archivo.variable} ${sora.variable} ${azeret.variable}`}>
      <body>{children}</body>
    </html>
  );
}
