import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/data';
import { signIn, signUp } from '@/app/actions';
import { Notice, Tile } from '@/components/ui';

export const metadata: Metadata = { title: 'Sign in' };

export default async function SignIn({ searchParams }: { searchParams: Promise<{ mode?: string; next?: string; error?: string; notice?: string }> }) {
  const sp = await searchParams;
  if (await getUser()) redirect('/fellowships');
  const up = sp.mode === 'up';
  const next = sp.next?.startsWith('/') && !sp.next.startsWith('//') ? sp.next : '/fellowships';
  const other = `/sign-in?${new URLSearchParams({ ...(up ? {} : { mode: 'up' }), next })}`;
  return (
    <div className="split">
      <div className="band">
        <h1>Never miss a closing date.</h1>
        <p className="lead">Save the fellowships you want and watch the days count down.</p>
        <div className="tiles" aria-hidden="true"><Tile days={21} /><Tile days={40} /><Tile days={null} /></div>
      </div>
      <div>
        <form className="form" action={up ? signUp : signIn}>
          <h2>{up ? 'Create your account' : 'Welcome back'}</h2>
          {sp.error ? <Notice bad>{sp.error}</Notice> : null}
          {sp.notice ? <Notice>{sp.notice}</Notice> : null}
          <input type="hidden" name="next" value={next} />
          <div className="field"><label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" /></div>
          <div className="field"><label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required minLength={8} autoComplete={up ? 'new-password' : 'current-password'} /></div>
          <button className="btn">{up ? 'Create account' : 'Sign in'}</button>
          <Link className="btn ghost" href={other}>{up ? 'I already have an account' : 'Create an account'}</Link>
          <Link href="/fellowships" className="muted">Keep browsing without an account</Link>
        </form>
      </div>
    </div>
  );
}
