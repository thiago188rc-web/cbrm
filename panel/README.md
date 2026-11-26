# RM GROWTH OS

Panel comercial privado de Cabinas Desarmables RM: CRM, atribución de ventas,
ventas, comisiones de NEXA, marketing y reportes. Desarrollado por NEXA.

Vive en `panel/` dentro del repo de la web, pero es **otro proyecto**: la web
pública (raíz del repo) sigue siendo HTML plano y se publica aparte.

| | |
|---|---|
| Producción | `https://panel.cabinasdesarmablesrm.com` (proyecto de Vercel con Root Directory `panel`) |
| Stack | Next.js 16 (App Router, `proxy.ts`), TypeScript, Tailwind 4, Supabase (`@supabase/ssr`), Zod |
| Base | Supabase (Postgres + Auth), región São Paulo. Migraciones en `../supabase/migrations` |
| Dirección visual | [DESIGN.md](DESIGN.md) |

## Etapas

1. **Autenticación y estructura** ← hecho: login por invitación, roles, Equipo, Actividad, Mi cuenta.
2. CRM y captura de leads desde la web.
3. Atribución de ventas.
4. Ventas y comisiones.
5. Dashboard.
6. Marketing y calendario.
7. Reportes e integraciones.

## Seguridad (cómo está armado)

- **Tres capas.** `src/proxy.ts` redirige rápido a quien no tiene sesión. `src/lib/auth.ts`
  verifica en el servidor (firma del token con `getClaims()` + perfil activo en la base)
  en cada página y en cada Server Action. RLS en Postgres es la última palabra: aunque
  alguien saltee la interfaz, la base no le devuelve lo que no le corresponde.
- **El rol vive en `profiles`**, nunca en `user_metadata` (que el usuario puede editar).
  `authenticated` no tiene permiso de escritura sobre la columna `role`.
- **La clave secreta** (`SUPABASE_SECRET_KEY`) solo se usa en `src/lib/supabase/admin.ts`
  (`server-only`), para invitar, cambiar roles y dar de baja, siempre después de autorizar.
- **Bajas inmediatas.** Dar de baja pone el perfil inactivo (RLS deja sin datos aunque el
  token siga vigente) y bloquea la cuenta en Auth.
- **Auditoría inmutable.** Un trigger guarda antes/después de cada cambio con su autor;
  cuando actúa el servidor, el autor viaja en `x-actor-id` y la base solo lo acepta de la
  clave secreta.
- **Links de un solo uso.** Las invitaciones y recuperaciones se generan con
  `generateLink` y las comparte un administrador. La página `/auth/confirm` pide tocar un
  botón: la vista previa de WhatsApp (que hace GET) no consume el token.
- **CSP con nonce** por request, `frame-ancestors 'none'`, `noindex` en todo el panel.

Roles: `nexa_admin` (NEXA), `rm_admin` (RM, administra a su equipo y confirma
operaciones) y `rm_vendedor` (preparado). RM no puede crear ni tocar cuentas de NEXA.

## Puesta en marcha

1. **Supabase:** crear el proyecto (región `sa-east-1`). En Authentication:
   - desactivar el registro abierto (*Allow new users to sign up* → off);
   - *Email OTP Expiration*: 86400 (24 h) para que el link de invitación no venza en 1 h;
   - *Site URL*: la URL del panel.
2. **Variables:** copiar `.env.example` a `.env.local` y completar URL, clave publicable y
   clave secreta (Project Settings → API Keys).
3. **Migraciones:** `npx supabase@3.4.0 login`, `npx supabase@3.4.0 link --project-ref <ref>`,
   `npx supabase@3.4.0 db push` (desde la raíz del repo).
4. **Primer administrador:**
   `node --env-file=.env.local scripts/invite-first-admin.mjs mail@nexa.com "Nombre"`.
   Devuelve el link para crear la contraseña. Después, todo se invita desde **Equipo**.
5. `npm run dev` → http://localhost:3000

## Comandos

```bash
npm run dev         # desarrollo
npm run build       # build de producción
npm run typecheck   # TypeScript
npm run test:db     # migraciones + pruebas de permisos (RLS) sobre Postgres real (PGlite)
```

`test:db` corre las migraciones sobre un Postgres embebido con el esquema `auth` de
Supabase simulado y prueba, rol por rol, qué puede leer y escribir cada uno. Cada etapa
suma sus pruebas en `../supabase/tests/`.
