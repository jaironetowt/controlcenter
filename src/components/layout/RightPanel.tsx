import { QuickNotes } from '@/components/gadgets/QuickNotes';
import { Upcoming } from '@/components/gadgets/Upcoming';
import { GadgetSlot } from '@/components/gadgets/GadgetSlot';

function GadgetCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4">
      {children}
    </div>
  );
}

export function RightPanel() {
  return (
    <aside className="w-[280px] h-full flex-shrink-0 bg-[#F4F4F5] border-l border-zinc-200 overflow-y-auto">
      <div className="flex flex-col gap-3 p-4">
        <GadgetCard>
          <QuickNotes />
        </GadgetCard>

        <GadgetCard>
          <Upcoming />
        </GadgetCard>

        <GadgetSlot />
      </div>
    </aside>
  );
}
