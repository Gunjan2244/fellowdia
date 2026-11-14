import Link from 'next/link';
import { CATEGORIES, searchFellowships } from '@/lib/data';
import { FellowshipItem, Tile } from '@/components/ui';

const SAMPLE = [
  { d: 3, t: 'Climate Reporting Fellowship', o: 'Example Foundation' },
  { d: 12, t: 'Public Policy Residency', o: 'Example Institute' },
  { d: null, t: 'Open Research Fellowship', o: 'Example Labs' },
];

export default async function Landing() {
  const soon = await searchFellowships('', null, 4);
  return (
    <>
      <section className="band">
        <div className="wrap hero">
          <div className="stack-l">
            <h1>Every fellowship, sorted by the day it closes.</h1>
            <p className="lead">Fellowdia counts down to each deadline, so you apply while there is still time.</p>
            <div className="actions">
              <Link className="btn accent" href="/fellowships">Browse fellowships</Link>
              <Link className="btn ghost" href="/sign-in?mode=up">Create free account</Link>
            </div>
          </div>
          <div className="mock" aria-hidden="true">
            {SAMPLE.map((s) => (
              <div className="item" key={s.t}>
                <Tile days={s.d} />
                <div><h2>{s.t}</h2><p className="muted">{s.o}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {soon.length > 0 ? (
        <section className="section">
          <div className="wrap stack-l">
            <h2>Closing soon</h2>
            <div className="grid">{soon.map((f) => <FellowshipItem key={f.id} f={f} />)}</div>
            <div><Link className="btn ghost" href="/fellowships">See all open fellowships</Link></div>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="wrap stack-l">
          <h2>How it works</h2>
          <div className="steps">
            <div><h3>Browse by deadline</h3><p>The list is ordered by what closes next, and the tile turns dark in the final week.</p></div>
            <div><h3>Save a shortlist</h3><p>Sign in once and keep the fellowships you want, available on every device.</p></div>
            <div><h3>Apply at the source</h3><p>Every listing links to the official application, so you never hand details to a middleman.</p></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap stack-l">
          <h2>Find your field</h2>
          <div className="chips">
            {CATEGORIES.map((c) => <Link key={c} className="chip" href={`/fellowships?cat=${c}`}>{c}</Link>)}
          </div>
        </div>
      </section>

      <section className="band warm">
        <div className="wrap stack-l section">
          <h2>Get to the next deadline before it passes.</h2>
          <div><Link className="btn" href="/sign-in?mode=up">Create your account</Link></div>
        </div>
      </section>
    </>
  );
}
