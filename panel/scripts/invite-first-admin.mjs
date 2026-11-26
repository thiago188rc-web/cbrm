// Crea la primera cuenta de NEXA (nexa_admin) y devuelve su link de
// invitación. Se usa UNA vez por base: después, las invitaciones se hacen
// desde el panel (Equipo). Se niega a correr si ya hay un administrador.
//
// Uso (desde panel/, con .env.local completo):
//   node --env-file=.env.local scripts/invite-first-admin.mjs mail@nexa.com "Nombre Apellido"
import { createClient } from '@supabase/supabase-js';

const [email, ...nombre] = process.argv.slice(2);
const fullName = nombre.join(' ').trim();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
const panel = (process.env.NEXT_PUBLIC_PANEL_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || fullName.length < 2) {
  console.error('Uso: node --env-file=.env.local scripts/invite-first-admin.mjs mail@nexa.com "Nombre Apellido"');
  process.exit(1);
}
if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en .env.local');
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const { count, error: countError } = await db
  .from('profiles')
  .select('id', { count: 'exact', head: true })
  .in('role', ['nexa_admin', 'rm_admin']);
if (countError) {
  console.error('No se pudo leer profiles. ¿Corriste la migración?', countError.message);
  process.exit(1);
}
if (count > 0) {
  console.error('Ya hay administradores. Las invitaciones se hacen desde el panel, en Equipo.');
  process.exit(1);
}

const { data, error } = await db.auth.admin.generateLink({ type: 'invite', email: email.toLowerCase() });
if (error || !data?.user) {
  console.error('No se pudo crear la invitación:', error?.message);
  process.exit(1);
}
const { error: perfilError } = await db
  .from('profiles')
  .insert({ id: data.user.id, email: email.toLowerCase(), full_name: fullName, role: 'nexa_admin' });
if (perfilError) {
  await db.auth.admin.deleteUser(data.user.id);
  console.error('No se pudo crear el perfil (se deshizo la cuenta):', perfilError.message);
  process.exit(1);
}

console.log('\nCuenta creada. Abrí este link para crear tu contraseña (sirve una sola vez):\n');
console.log(`${panel}/auth/confirm?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=invite\n`);
