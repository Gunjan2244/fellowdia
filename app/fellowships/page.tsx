import type { Metadata } from 'next';
import Link from 'next/link';
import { CATEGORIES, searchFellowships } from '@/lib/data';
import { Empty, FellowshipItem } from '@/components/ui';

export const metadata: Metadata = { title: 'Discover' };

export default async function Discover({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim().slice(0, 80);
  const cat = CATEGORIES.includes(sp.cat ?? '') ? sp.cat! : null;
  const list = await searchFellowships(q, cat);
  const href = (c: string | null) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (c) p.set('cat', c);
    return p.size ? `/fellowships?${p}` : '/fellowships';
  };
  return (
    <div className="wrap page stack-l">
      <div>
        <h1>Discover</h1>
        <p className="muted">{list.length} open {list.length === 1 ? 'fellowship' : 'fellowships'}, closing soonest first.</p>
      </div>
      <form className="search" action="/fellowships" role="search">
        <input name="q" type="search" defaultValue={q} placeholder="Search by title or organization" aria-label="Search fellowships" maxLength={80} />
        {cat ? <input type="hidden" name="cat" value={cat} /> : null}
        <button className="btn">Search</button>
      </form>
      <div className="chips" role="group" aria-label="Category">
        <Link className="chip" href={href(null)} aria-current={cat === null}>All</Link>
        {CATEGORIES.map((c) => <Link key={c} className="chip" href={href(c)} aria-current={cat === c}>{c}</Link>)}
      </div>
      {list.length
        ? <div className="grid">{list.map((f) => <FellowshipItem key={f.id} f={f} />)}</div>
        : q || cat
          ? <Empty title="No fellowships match" body="Clear the search or pick another category."><div><Link className="btn ghost" href="/fellowships">Clear filters</Link></div></Empty>
          : <Empty title="No open fellowships yet" body="New fellowships are posted by our team. Check back soon." />}
    </div>
  );
}
