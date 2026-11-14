import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Bricolage_Grotesque } from 'next/font/google';
import { getUser, isAdmin } from '@/lib/data';
import { signOut } from './actions';

const font = Bricolage_Grotesque({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', variable: '--font' });

export const metadata: Metadata = {
  title: { default: 'Fellowdia: fellowships, closing soonest first', template: '%s · Fellowdia' },
  description: 'Open fellowships with a live countdown to every deadline. Save a shortlist and apply at the source.',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getUser();
  const admin = user ? await isAdmin() : false;
  return (
    <html lang="en" className={font.variable}>
      <body>
        <header className="bar">
          <div className="wrap">
            <Link href="/" className="brand">Fellowdia</Link>
            <nav aria-label="Main">
              <Link href="/fellowships">Discover</Link>
              <Link href="/saved">Saved</Link>
              {admin ? <Link href="/admin">Manage</Link> : null}
            </nav>
            {user
              ? <form action={signOut}><button className="btn ghost">Sign out</button></form>
              : <Link className="btn" href="/sign-in">Sign in</Link>}
          </div>
        </header>
        <main>{children}</main>
        <footer><div className="wrap">Fellowdia lists fellowships posted by our team. Always confirm details on the official site before you apply.</div></footer>
      </body>
    </html>
  );
}
