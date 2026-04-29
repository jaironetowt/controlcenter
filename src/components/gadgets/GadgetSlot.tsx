import { IconPlus } from '@tabler/icons-react';

interface GadgetSlotProps {
  label?: string;
}

export function GadgetSlot({ label = 'Add gadget' }: GadgetSlotProps) {
  return (
    <button className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-zinc-200 text-zinc-400 hover:border-blue-300 hover:text-blue-400 transition-colors group">
      <IconPlus size={18} className="group-hover:scale-110 transition-transform" />
      <span className="text-[13px] text-zinc-400">{label}</span>
    </button>
  );
}
