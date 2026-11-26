import type { NextConfig } from "next";

/* Cache Components queda apagado a propósito: todas las pantallas del panel
   son privadas y muestran datos comerciales al momento. No hay "cáscara
   estática" que prerenderizar, y prenderlo obligaría a envolver cada lectura
   de sesión en <Suspense> con riesgo de servir datos viejos.

   La Content-Security-Policy no está acá: lleva un nonce distinto en cada
   respuesta y la arma src/proxy.ts. Acá van las cabeceras fijas. */
const nextConfig: NextConfig = {
  poweredByHeader: false,
  /* Tailwind 4 se procesa con su loader de Turbopack (no hay PostCSS). */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          /* Nada del panel se indexa, aunque alguien filtre un enlace. */
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
    ];
  },
};

export default nextConfig;
