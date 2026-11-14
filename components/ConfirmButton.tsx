'use client';
export default function ConfirmButton({ label, message }: { label: string; message: string }) {
  return <button className="btn ghost" onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}>{label}</button>;
}
