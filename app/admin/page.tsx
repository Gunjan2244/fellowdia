import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin, type Fellowship } from '@/lib/data';
import { supabaseServer } from '@/lib/supabase/server';
import { removeFellowship, setStatus } from '@/app/actions';
import ConfirmButton from '@/components/ConfirmButton';
import { Empty } from '@/components/ui';

export const metadata: Metadata = { title: 'Manage fellowships' };

export default async function Admin() {
  await requireAdmin();
  const sb = await supabaseServer();
  const { data } = await sb.from('fellowships').select('*').order('created_at', { ascending: false });
  const list = (data ?? []) as Fellowship[];
  return (
    <div className="wrap page stack-l">
      <h1>Manage</h1>
      <div><Link className="btn" href="/admin/edit">New fellowship</Link></div>
      {list.length === 0 ? <Empty title="No fellowships yet" body="Create the first one." /> : (
        <div>
          {list.map((f) => (
            <div key={f.id} className="admin-item">
              <h2>{f.title}</h2>
              <p className={f.status === 'published' ? '' : 'muted'}>{f.status === 'published' ? 'Published' : 'Draft'}</p>
              <div className="actions">
                <Link className="btn ghost" href={`/admin/edit?id=${f.id}`}>Edit</Link>
                <form action={setStatus}>
                  <input type="hidden" name="id" value={f.id} />
                  <input type="hidden" name="status" value={f.status === 'published' ? 'draft' : 'published'} />
                  <button className="btn ghost">{f.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                </form>
                <form action={removeFellowship}>
                  <input type="hidden" name="id" value={f.id} />
                  <ConfirmButton label="Delete" message="Delete this fellowship? It will also leave users’ Saved lists." />
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
