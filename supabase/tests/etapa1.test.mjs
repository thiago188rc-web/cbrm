// Pruebas de permisos de la Etapa 1 (roles, perfiles, auditoría).
// Se corren contra Postgres real con el harness de PGlite; ver supabase/tests/README.md.
const A = '00000000-0000-4000-8000-00000000000a'; // NEXA admin
const B = '00000000-0000-4000-8000-00000000000b'; // RM admin
const C = '00000000-0000-4000-8000-00000000000c'; // RM vendedor
const D = '00000000-0000-4000-8000-00000000000d'; // dado de baja

export default async function ({ as, check, db }) {
  await db.exec(`insert into auth.users (id, email) values
    ('${A}','a@nexa.test'),('${B}','b@rm.test'),('${C}','c@rm.test'),('${D}','d@rm.test')`);

  // Altas desde el servidor (clave secreta), con el autor en la cabecera.
  let r = await as('service_role', null,
    `insert into public.profiles (id, email, full_name, role) values ($1,'a@nexa.test','A','nexa_admin')`, [A]);
  check('servidor crea el primer admin', !r.error, r.error);
  r = await as('service_role', null,
    `insert into public.profiles (id, email, full_name, role, invited_by) values
     ($1,'b@rm.test','B','rm_admin',$4),($2,'c@rm.test','C','rm_vendedor',$4),($3,'d@rm.test','D','rm_vendedor',$4)`,
    [B, C, D, A], { 'x-actor-id': A });
  check('servidor invita al resto', !r.error, r.error);
  await as('service_role', null, `update public.profiles set active = false where id = $1`, [D], { 'x-actor-id': A });

  r = await as('service_role', null,
    `select actor_id from public.audit_log where entity='profiles' and entity_id=$1 and action='insert'`, [B]);
  check('auditoría registra quién invitó (cabecera del servidor)', r.rows?.[0]?.actor_id === A, JSON.stringify(r));

  // Visitante sin sesión
  r = await as('anon', null, `select * from public.profiles`);
  check('anon no puede leer perfiles', !!r.error, JSON.stringify(r));
  r = await as('anon', null, `select app.my_role()`);
  check('anon no puede usar las funciones de app', !!r.error, JSON.stringify(r));

  // Vendedor
  r = await as('authenticated', C, `select id from public.profiles`);
  check('vendedor ve al equipo (4 perfiles)', r.rows?.length === 4, JSON.stringify(r));
  r = await as('authenticated', C, `select * from public.audit_log`);
  check('vendedor no ve la auditoría', r.rows?.length === 0, JSON.stringify(r));
  r = await as('authenticated', C, `update public.profiles set full_name='C nuevo' where id=$1`, [C]);
  check('vendedor edita su nombre', !r.error && r.affected === 1, JSON.stringify(r));
  r = await as('authenticated', C, `update public.profiles set role='rm_admin' where id=$1`, [C]);
  check('vendedor NO puede cambiarse el rol', !!r.error, JSON.stringify(r));
  r = await as('authenticated', C, `update public.profiles set full_name='hack' where id=$1`, [B]);
  check('vendedor no edita a otro', r.affected === 0, JSON.stringify(r));
  r = await as('authenticated', C, `insert into public.audit_log (action, entity) values ('x','y')`);
  check('nadie escribe la auditoría a mano', !!r.error, JSON.stringify(r));
  r = await as('authenticated', C, `update public.profiles set full_name='C2' where id=$1`, [C], { 'x-actor-id': A });
  r = await as('service_role', null,
    `select actor_id from public.audit_log where entity='profiles' and entity_id=$1 order by id desc limit 1`, [C]);
  check('un usuario no puede hacerse pasar por otro con la cabecera', r.rows?.[0]?.actor_id === C, JSON.stringify(r));

  // Dado de baja: token válido, pero sin acceso a nada
  r = await as('authenticated', D, `select id from public.profiles`);
  check('usuario dado de baja no ve nada', r.rows?.length === 0, JSON.stringify(r));
  r = await as('authenticated', D, `update public.profiles set full_name='x' where id=$1`, [D]);
  check('usuario dado de baja no edita nada', r.affected === 0, JSON.stringify(r));

  // Administradores
  r = await as('authenticated', B, `select count(*)::int n from public.audit_log`);
  check('RM admin lee la auditoría', r.rows?.[0]?.n > 0, JSON.stringify(r));
  r = await as('authenticated', A, `select count(*)::int n from public.audit_log`);
  check('NEXA admin lee la auditoría', r.rows?.[0]?.n > 0, JSON.stringify(r));
  r = await as('authenticated', B, `delete from public.profiles where id=$1`, [C]);
  check('ni un admin borra perfiles desde la API', !!r.error || r.affected === 0, JSON.stringify(r));
}
