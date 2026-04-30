'use client';

import { useState } from 'react';
import { IconNotes } from '@tabler/icons-react';

export function QuickNotes() {
  const [value, setValue] = useState('');

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <IconNotes size={15} className="text-orange-500" />
        <span className="text-[14px] font-semibold text-zinc-800">Quick Notes</span>
      </div>
      <textarea
        placeholder="Type anything here…"
        value={value}
        rows={5}
        onChange={(e) => setValue(e.target.value)}
        className="w-full text-[13px] bg-[#F9F9FA] border border-orange-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-1 focus:ring-orange-300 placeholder:text-zinc-400 text-zinc-800"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="self-end text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
