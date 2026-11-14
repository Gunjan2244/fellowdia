import type { Metadata } from 'next';
import Link from 'next/link';
import { requireUser, type Fellowship } from '@/lib/data';
import { supabaseServer } from '@/lib/supabase/server';
import { Empty, FellowshipItem } from '@/components/ui';

export const metadata: Metadata = { title: 'Saved' };

export default async function Saved() {
  await requireUser('/saved');
  const sb = await supabaseServer();
  const { data } = await sb.from('saves').select('fellowship:fellowships(*)').order('created_at', { ascending: false });
  const list = ((data ?? []) as unknown as { fellowship: Fellowship | null }[]).map((r) => r.fellowship).filter((f): f is Fellowship => !!f);
  return (
    <div className="wrap page stack-l">
      <h1>Saved</h1>
      {list.length
        ? <div className="grid">{list.map((f) => <FellowshipItem key={f.id} f={f} />)}</div>
        : <Empty title="Nothing saved yet" body="Open a fellowship and choose Save."><div><Link className="btn" href="/fellowships">Discover fellowships</Link></div></Empty>}
    </div>
  );
}
