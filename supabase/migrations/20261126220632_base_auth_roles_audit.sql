-- ══════════════════════════════════════════════════════════════════════
-- RM GROWTH OS — Etapa 1: roles, perfiles y registro de auditoría.
--
-- Reglas de esta base:
--  · RLS en todas las tablas de `public`.
--  · Desde octubre de 2026 las tablas nuevas NO quedan expuestas a la Data API:
--    cada tabla declara acá mismo sus GRANT, junto con su RLS.
--  · Las funciones de apoyo viven en el esquema `app`, que la Data API no
--    expone. Ninguna función SECURITY DEFINER queda en `public`.
--  · Altas de usuarios, cambios de rol y bajas los hace el servidor del panel
--    con la clave secreta, después de validar permisos. `authenticated` nunca
--    puede cambiar un rol.
-- ══════════════════════════════════════════════════════════════════════

create schema if not exists app;
revoke all on schema app from public;
grant usage on schema app to authenticated, service_role;

-- ── Roles ─────────────────────────────────────────────────────────────
-- nexa_admin : NEXA. Ve lo atribuido, ventas y comisiones; gestiona marketing.
-- rm_admin   : RM. Gestiona los datos comerciales y confirma operaciones.
-- rm_vendedor: RM. Preparado para cuando haya vendedores con acceso acotado.
create type public.app_role as enum ('nexa_admin', 'rm_admin', 'rm_vendedor');

-- ── Perfiles ──────────────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text not null default '' check (char_length(full_name) <= 120),
  role        public.app_role not null,
  active      boolean not null default true,
  invited_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table public.profiles is 'Usuarios del panel. El rol es la única fuente de autorización (nunca user_metadata).';

alter table public.profiles enable row level security;

-- ── Funciones de apoyo (esquema app, no expuesto) ─────────────────────
-- SECURITY DEFINER para leer el rol sin recursión de RLS sobre profiles.
-- search_path vacío y nombres calificados: no se puede secuestrar.
create function app.my_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid()) and p.active
$$;

create function app.is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app.my_role() is not null
$$;

create function app.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(app.my_role() in ('nexa_admin', 'rm_admin'), false)
$$;

create function app.is_rm()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(app.my_role() in ('rm_admin', 'rm_vendedor'), false)
$$;

revoke all on function app.my_role(), app.is_member(), app.is_admin(), app.is_rm() from public;
grant execute on function app.my_role(), app.is_member(), app.is_admin(), app.is_rm()
  to authenticated, service_role;

-- updated_at automático
create function app.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function app.touch_updated_at();

-- ── Registro de auditoría ─────────────────────────────────────────────
-- Inmutable desde la API: solo se escribe por trigger o desde el servidor.
create table public.audit_log (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  actor_id    uuid references public.profiles (id) on delete set null,
  action      text not null check (char_length(action) <= 60),
  entity      text not null check (char_length(entity) <= 60),
  entity_id   text,
  before      jsonb,
  after       jsonb,
  meta        jsonb
);
create index audit_log_at_idx on public.audit_log (at desc);
create index audit_log_entity_idx on public.audit_log (entity, entity_id);

alter table public.audit_log enable row level security;

-- Quién está actuando:
--  · un usuario con sesión → auth.uid();
--  · el servidor del panel con la clave secreta → la cabecera x-actor-id que
--    manda después de autorizar. Solo se acepta si el pedido viene con rol
--    service_role: un usuario común no puede hacerse pasar por otro.
create function app.actor_id()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_role text;
  v_hdr text;
begin
  if v_uid is not null then
    return v_uid;
  end if;
  v_role := coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb) ->> 'role'
  );
  if v_role is distinct from 'service_role' then
    return null;
  end if;
  v_hdr := (nullif(current_setting('request.headers', true), '')::jsonb) ->> 'x-actor-id';
  if v_hdr ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return v_hdr::uuid;
  end if;
  return null;
end
$$;
revoke all on function app.actor_id() from public;
grant execute on function app.actor_id() to authenticated, service_role;

-- Trigger genérico: guarda antes/después de cada cambio en las tablas que lo
-- usen. SECURITY DEFINER porque authenticated no puede insertar en audit_log.
create function app.audit_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id text;
  v_actor uuid := app.actor_id();
begin
  v_id := (case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end) ->> 'id';
  -- Si el actor ya no existe como perfil (o es el propio perfil que se está
  -- borrando), queda sin actor en vez de romper la operación por la FK.
  if v_actor is not null and not exists (select 1 from public.profiles where id = v_actor) then
    v_actor := null;
  end if;
  insert into public.audit_log (actor_id, action, entity, entity_id, before, after)
  values (
    v_actor,
    lower(tg_op),
    tg_table_name,
    v_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end
$$;
revoke all on function app.audit_row() from public;

create trigger profiles_audit
  after insert or update or delete on public.profiles
  for each row execute function app.audit_row();

-- ── Políticas ─────────────────────────────────────────────────────────
-- Perfiles: cualquier miembro activo ve al equipo (para asignar responsables).
create policy "miembros ven el equipo"
  on public.profiles for select
  to authenticated
  using ( (select app.is_member()) );

-- Cada uno edita solo su nombre. La columna está limitada por GRANT abajo.
create policy "cada uno edita su nombre"
  on public.profiles for update
  to authenticated
  using ( id = (select auth.uid()) and (select app.is_member()) )
  with check ( id = (select auth.uid()) );

-- Auditoría: solo administradores (NEXA y RM) la leen.
create policy "administradores leen la auditoría"
  on public.audit_log for select
  to authenticated
  using ( (select app.is_admin()) );

-- ── Exposición a la Data API ──────────────────────────────────────────
-- anon: nada. authenticated: lo justo, siempre filtrado por RLS.
revoke all on public.profiles, public.audit_log from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;
grant select on public.audit_log to authenticated;

grant all on public.profiles, public.audit_log to service_role;
grant usage on sequence public.audit_log_id_seq to service_role;
