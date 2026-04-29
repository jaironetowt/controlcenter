'use client';

import { useState } from 'react';
import { Textarea } from '@mantine/core';
import { IconNotes } from '@tabler/icons-react';

export function QuickNotes() {
  const [value, setValue] = useState('');

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <IconNotes size={15} className="text-zinc-400" />
        <span className="text-[12px] font-semibold text-zinc-700">Quick Notes</span>
      </div>
      <Textarea
        placeholder="Type anything here…"
        autosize
        minRows={5}
        maxRows={10}
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        styles={{
          input: {
            fontSize: '12px',
            backgroundColor: '#F9F9FA',
            border: '1px solid #E4E4E7',
            borderRadius: '8px',
            resize: 'none',
          },
        }}
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
