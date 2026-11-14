import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { daysLeft, formatDate, getFellowship, getUser } from '@/lib/data';
import { supabaseServer } from '@/lib/supabase/server';
import { toggleSave } from '@/app/actions';
import { Tile } from '@/components/ui';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = await getFellowship((await params).id);
  return { title: f?.title ?? 'Fellowship' };
}

const Block = ({ title, body }: { title: string; body: string | null }) =>
  body ? <div className="stack"><h2>{title}</h2><p style={{ whiteSpace: 'pre-line' }}>{body}</p></div> : null;

export default async function Detail({ params }: Props) {
  const { id } = await params;
  const f = await getFellowship(id);
  if (!f) notFound();
  const user = await getUser();
  let saved = false;
  if (user) {
    const sb = await supabaseServer();
    const { data } = await sb.from('saves').select('fellowship_id').eq('fellowship_id', id).maybeSingle();
    saved = !!data;
  }
  return (
    <div className="wrap page detail">
      <article className="stack-l">
        <div><p className="muted">{f.category}</p><h1>{f.title}</h1><p className="lead muted">{f.organization}</p></div>
        <Block title="About" body={f.description} />
        <Block title="Who can apply" body={f.eligibility} />
        <Block title="Stipend" body={f.stipend} />
        <Block title="Location" body={f.location} />
      </article>
      <aside className="aside">
        <Tile days={daysLeft(f.deadline)} />
        <p>{f.deadline ? `Closes ${formatDate(f.deadline)}` : 'Applications are open year-round'}</p>
        {/^https:\/\//i.test(f.apply_url)
          ? <a className="btn" href={f.apply_url} target="_blank" rel="noopener noreferrer">Apply on the official site</a> : null}
        <form action={toggleSave} style={{ width: '100%' }}>
          <input type="hidden" name="id" value={f.id} />
          <input type="hidden" name="saved" value={saved ? '1' : '0'} />
          <button className="btn ghost" style={{ width: '100%' }}>{saved ? 'Remove from Saved' : 'Save'}</button>
        </form>
      </aside>
    </div>
  );
}
