'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { supabaseServer } from '@/lib/supabase/server';
import { CATEGORIES, requireAdmin } from '@/lib/data';

const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const safeNext = (n: string) => (n.startsWith('/') && !n.startsWith('//') ? n : '/fellowships');
const back = (path: string, error: string, extra = ''): never =>
  redirect(`${path}?error=${encodeURIComponent(error)}${extra}`);

export async function signIn(f: FormData) {
  const next = safeNext(str(f, 'next'));
  const sb = await supabaseServer();
  const { error } = await sb.auth.signInWithPassword({ email: str(f, 'email'), password: String(f.get('password') ?? '') });
  if (error) back('/sign-in', error.message, `&next=${encodeURIComponent(next)}`);
  redirect(next);
}

export async function signUp(f: FormData) {
  const next = safeNext(str(f, 'next'));
  const email = str(f, 'email');
  const password = String(f.get('password') ?? '');
  const extra = `&mode=up&next=${encodeURIComponent(next)}`;
  if (!/^\S+@\S+\.\S+$/.test(email)) back('/sign-in', 'Enter a valid email address.', extra);
  if (password.length < 8) back('/sign-in', 'Use a password of at least 8 characters.', extra);
  const origin = (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const sb = await supabaseServer();
  const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: `${origin}/auth/callback` } });
  if (error) back('/sign-in', error.message, extra);
  if (!data.session) redirect(`/sign-in?notice=${encodeURIComponent('Check your email to confirm your account, then sign in.')}`);
  redirect(next);
}

export async function signOut() {
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect('/');
}

export async function toggleSave(f: FormData) {
  const id = str(f, 'id');
  const saved = str(f, 'saved') === '1';
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(`/fellowships/${id}`)}`);
  if (saved) await sb.from('saves').delete().eq('fellowship_id', id);
  else await sb.from('saves').insert({ fellowship_id: id });
  revalidatePath('/saved');
  revalidatePath(`/fellowships/${id}`);
}

// ---- admin: checked here and again by Postgres RLS ----
export async function saveFellowship(f: FormData) {
  await requireAdmin();
  const id = str(f, 'id');
  const row = {
    title: str(f, 'title'), organization: str(f, 'organization'), description: str(f, 'description'),
    eligibility: str(f, 'eligibility') || null, stipend: str(f, 'stipend') || null, location: str(f, 'location') || null,
    category: str(f, 'category'), deadline: str(f, 'deadline') || null, apply_url: str(f, 'apply_url'),
    status: str(f, 'intent') === 'published' ? 'published' : 'draft',
  };
  const fail = (m: string): never => back('/admin/edit', m, id ? `&id=${id}` : '');
  if (row.title.length < 3) fail('Enter a title of at least 3 characters.');
  if (row.organization.length < 2) fail('Enter the organization.');
  if (!row.description) fail('Describe the fellowship.');
  if (!CATEGORIES.includes(row.category)) fail('Pick a category.');
  if (!/^https:\/\/\S+\.\S+/.test(row.apply_url)) fail('The application link must start with https://');
  if (row.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(row.deadline)) fail('Use a valid deadline date.');
  const sb = await supabaseServer();
  const { error } = id ? await sb.from('fellowships').update(row).eq('id', id) : await sb.from('fellowships').insert(row);
  if (error) fail(error.message);
  revalidatePath('/', 'layout');
  redirect('/admin');
}

export async function setStatus(f: FormData) {
  await requireAdmin();
  const sb = await supabaseServer();
  await sb.from('fellowships').update({ status: str(f, 'status') === 'published' ? 'published' : 'draft' }).eq('id', str(f, 'id'));
  revalidatePath('/', 'layout');
}

export async function removeFellowship(f: FormData) {
  await requireAdmin();
  const sb = await supabaseServer();
  await sb.from('fellowships').delete().eq('id', str(f, 'id'));
  revalidatePath('/', 'layout');
}
