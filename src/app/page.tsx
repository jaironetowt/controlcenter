import { Sidebar } from '@/components/layout/Sidebar';
import { RightPanel } from '@/components/layout/RightPanel';

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F4F5]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pl-10 pr-6 py-6">
        {/* Main content area — gadget grid comes here */}
        <div className="mb-1">
          <h1 className="text-xl font-bold text-zinc-900">Mosaic</h1>
          <p className="text-[13px] text-zinc-500">WillowTree Internal · Development · Jan – Jun 2026</p>
        </div>
      </main>

      <RightPanel />
    </div>
  );
}
