import { Sidebar } from '@/components/layout/Sidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { ActiveProjectHeader } from '@/components/layout/ActiveProjectHeader';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F4F5]">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <ActiveProjectHeader />

        <div className="flex-1 overflow-y-auto pl-10 pr-6 py-6">
          {/* Future gadget grid goes here */}
        </div>
      </main>

      <RightPanel />
    </div>
  );
}
