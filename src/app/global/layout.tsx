import { Sidebar } from '@/components/layout/Sidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { ReadOnlyBanner } from '@/components/layout/ReadOnlyBanner';

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function GlobalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F4F5]">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <ReadOnlyBanner />
        {children}
      </main>

      <RightPanel />
    </div>
  );
}
