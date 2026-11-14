import Link from 'next/link';
import { daysLeft, type Fellowship } from '@/lib/data';

export function Tile({ days }: { days: number | null }) {
  const urgent = days !== null && days <= 7;
  return (
    <div className={`tile${urgent ? ' urgent' : ''}`} role="img"
      aria-label={days === null ? 'Rolling deadline' : `${days} ${days === 1 ? 'day' : 'days'} left`}>
      {days === null ? <b className="roll">Rolling</b> : <><b>{days}</b><span>{days === 1 ? 'day left' : 'days left'}</span></>}
    </div>
  );
}

export function FellowshipItem({ f }: { f: Fellowship }) {
  return (
    <Link href={`/fellowships/${f.id}`} className="item">
      <Tile days={daysLeft(f.deadline)} />
      <div>
        <h2>{f.title}</h2>
        <p className="muted">{f.organization}</p>
        {f.stipend ? <p>{f.stipend}</p> : null}
      </div>
    </Link>
  );
}

export const Notice = ({ bad, children }: { bad?: boolean; children: React.ReactNode }) =>
  <p className={`notice${bad ? ' bad' : ''}`} role={bad ? 'alert' : 'status'}>{children}</p>;

export const Empty = ({ title, body, children }: { title: string; body?: string; children?: React.ReactNode }) =>
  <div className="stack empty"><h2>{title}</h2>{body ? <p className="muted">{body}</p> : null}{children}</div>;
