'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ─── Root redirect ─────────────────────────────────────────────────────────────
// Server-side redirect() is incompatible with output:'export'. Redirect on the
// client instead so the static shell can ship and bounce to /global at runtime.

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/global');
  }, [router]);

  return null;
}
