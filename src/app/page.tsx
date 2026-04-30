import { redirect } from 'next/navigation';

// ─── Root redirect ─────────────────────────────────────────────────────────────

export default function Home() {
  redirect('/dashboard');
}
