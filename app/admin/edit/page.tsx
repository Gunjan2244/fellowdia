import type { Metadata } from 'next';
import { CATEGORIES, getFellowship, requireAdmin } from '@/lib/data';
import { saveFellowship } from '@/app/actions';
import { Notice } from '@/components/ui';

export const metadata: Metadata = { title: 'Edit fellowship' };

const Field = ({ label, name, children }: { label: string; name: string; children: React.ReactNode }) =>
  <div className="field"><label htmlFor={name}>{label}</label>{children}</div>;

export default async function Edit({ searchParams }: { searchParams: Promise<{ id?: string; error?: string }> }) {
  await requireAdmin();
  const { id, error } = await searchParams;
  const f = id ? await getFellowship(id) : null;
  return (
    <div className="wrap page stack-l">
      <h1>{f ? 'Edit fellowship' : 'New fellowship'}</h1>
      <form className="form" action={saveFellowship}>
        {error ? <Notice bad>{error}</Notice> : null}
        <input type="hidden" name="id" value={f?.id ?? ''} />
        <Field label="Title" name="title"><input id="title" name="title" required minLength={3} maxLength={140} defaultValue={f?.title} /></Field>
        <Field label="Organization" name="organization"><input id="organization" name="organization" required minLength={2} maxLength={120} defaultValue={f?.organization} /></Field>
        <Field label="Category" name="category">
          <select id="category" name="category" defaultValue={f?.category ?? CATEGORIES[0]}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        </Field>
        <Field label="Description" name="description"><textarea id="description" name="description" required defaultValue={f?.description} /></Field>
        <Field label="Who can apply" name="eligibility"><textarea id="eligibility" name="eligibility" defaultValue={f?.eligibility ?? ''} /></Field>
        <Field label="Stipend" name="stipend"><input id="stipend" name="stipend" defaultValue={f?.stipend ?? ''} /></Field>
        <Field label="Location" name="location"><input id="location" name="location" defaultValue={f?.location ?? ''} /></Field>
        <Field label="Deadline (leave blank for rolling)" name="deadline"><input id="deadline" name="deadline" type="date" defaultValue={f?.deadline ?? ''} /></Field>
        <Field label="Application link" name="apply_url"><input id="apply_url" name="apply_url" type="url" required pattern="https://.+" placeholder="https://" defaultValue={f?.apply_url} /></Field>
        <div className="actions">
          <button className="btn ghost" name="intent" value="draft">Save draft</button>
          <button className="btn" name="intent" value="published">Publish</button>
        </div>
      </form>
    </div>
  );
}
