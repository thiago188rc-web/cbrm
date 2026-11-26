// Corre las migraciones de RM GROWTH OS sobre Postgres real (PGlite) con un
// esquema `auth` simulado como el de Supabase, y prueba RLS por rol.
// Uso (desde panel/): npm run test:db  ·  node scripts/db-test.mjs <carpeta de migraciones> [archivo de pruebas .mjs]
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = process.argv[2];
const db = new PGlite();

await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$
    select coalesce(
      nullif(current_setting('request.jwt.claim.sub', true), ''),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    )::uuid $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;
  grant usage on schema public to anon, authenticated, service_role;
`);

for (const f of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
  try {
    await db.exec(readFileSync(join(dir, f), 'utf8'));
    console.log('OK  migración', f);
  } catch (e) {
    console.log('ERR migración', f, '→', e.message);
    process.exit(1);
  }
}

let fails = 0;
export async function as(role, sub, sql, params = [], headers = {}) {
  await db.exec('begin');
  try {
    const claims = JSON.stringify(sub ? { sub, role } : { role });
    await db.query(`select set_config('request.jwt.claims', $1, true), set_config('request.headers', $2, true)`, [claims, JSON.stringify(headers)]);
    await db.exec(`set local role ${role}`);
    const r = await db.query(sql, params);
    await db.exec('commit');
    return { rows: r.rows, affected: r.affectedRows };
  } catch (e) {
    await db.exec('rollback');
    return { error: e.message };
  }
}
export function check(name, ok, detail = '') {
  if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  → ' + detail}`);
}
export { db };

if (process.argv[3]) {
  const mod = await import(pathToFileURL(resolve(process.argv[3])).href);
  await mod.default({ as, check, db });
}
console.log(fails ? `\n${fails} prueba(s) fallaron` : '\nTodas las pruebas pasaron');
process.exit(fails ? 1 : 0);
