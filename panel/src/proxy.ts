import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/* Rutas que se ven sin sesión. Todo lo demás exige estar logueado.
   Esto es solo el primer filtro (redirige rápido): la autorización real se
   repite en el servidor, en cada página y en cada Server Action (lib/auth). */
const PUBLICAS = ["/login", "/auth/confirm"];

function csp(nonce: string) {
  const dev = process.env.NODE_ENV === "development";
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  /* Scripts: solo con el nonce de esta respuesta ('strict-dynamic' deja que
     esos scripts carguen los chunks de Next). Estilos: 'unsafe-inline'
     porque los gráficos y React usan atributos style; no ejecutan código. */
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${supabase}`,
    "font-src 'self'",
    `connect-src 'self' ${supabase}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    dev ? "" : "upgrade-insecure-requests",
  ]
    .filter(Boolean)
    .join("; ");
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const policy = csp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);

  const next = () => NextResponse.next({ request: { headers: requestHeaders } });
  let response = next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          /* La sesión se renovó: el request que sigue tiene que ver las
             cookies nuevas, y la respuesta tiene que devolverlas sin caché
             (si no, una CDN podría servir la sesión de uno a otro). */
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          requestHeaders.set(
            "cookie",
            request.cookies
              .getAll()
              .map((c) => `${c.name}=${c.value}`)
              .join("; "),
          );
          response = next();
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  /* getClaims verifica la firma del token (no confía en lo que diga la
     cookie) y lo renueva si hace falta. No poner código entre la creación
     del cliente y esta llamada. */
  const { data } = await supabase.auth.getClaims();
  const logueado = Boolean(data?.claims?.sub);
  const path = request.nextUrl.pathname;
  const publica = PUBLICAS.some((p) => path === p || path.startsWith(p + "/"));

  if (!logueado && !publica) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = path === "/" ? "" : `?desde=${encodeURIComponent(path)}`;
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    redirect.headers.set("Content-Security-Policy", policy);
    return redirect;
  }

  response.headers.set("Content-Security-Policy", policy);
  return response;
}

export const config = {
  /* Todo menos los archivos estáticos de Next, las fuentes y el favicon. */
  matcher: ["/((?!_next/static|_next/image|fonts/|favicon.ico|icon.png).*)"],
};
