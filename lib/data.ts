import { cache } from 'react';
import { redirect } from 'next/navigation';
import { supabaseServer } from './supabase/server';

export const CATEGORIES = ['Research', 'Policy', 'Journalism', 'Technology', 'Arts', 'Climate'];

export type Fellowship = {
  id: string; title: string; organization: string; description: string; eligibility: string | null;
  stipend: string | null; location: string | null; category: string; deadline: string | null;
  apply_url: string; status: 'draft' | 'published';
};

export const getUser = cache(async () => {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  return data.user;
});

export const isAdmin = cache(async () => {
  const user = await getUser();
  if (!user) return false;
  const sb = await supabaseServer();
  const { data } = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle();
  return data?.role === 'admin';
});

export async function requireUser(next: string) {
  const user = await getUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return user;
}
export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/');
}

export const getFellowship = cache(async (id: string) => {
  const sb = await supabaseServer();
  const { data } = await sb.from('fellowships').select('*').eq('id', id).maybeSingle();
  return data as Fellowship | null;
});

export async function searchFellowships(q: string, cat: string | null, limit = 100) {
  const sb = await supabaseServer();
  const { data } = await sb.rpc('search_fellowships', { q, cat }).limit(limit);
  return (data ?? []) as Fellowship[];
}

export const daysLeft = (d: string | null) =>
  d ? Math.max(0, Math.ceil((new Date(`${d}T23:59:59`).getTime() - Date.now()) / 864e5)) : null;

export const formatDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { dateStyle: 'long' });
