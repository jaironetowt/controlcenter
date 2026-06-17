'use client';

import { useState, useEffect } from 'react';
import { Menu, Tooltip } from '@mantine/core';
import { IconChevronDown, IconCheck, IconUsers, IconUser } from '@tabler/icons-react';
import { useSpaceStore } from '@/stores/useSpaceStore';

// ─── SpaceSwitcher ──────────────────────────────────────────────────────────────
// Dropdown that lists the caller's own workspace plus any spaces shared with them.
// Selecting one calls selectSpace(ownerSub). Respects the collapsed sidebar state
// by rendering an icon-only trigger with a tooltip.

interface SpaceSwitcherProps {
  isCollapsed: boolean;
}

export function SpaceSwitcher({ isCollapsed }: SpaceSwitcherProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const me            = useSpaceStore((s) => s.me);
  const spaces        = useSpaceStore((s) => s.spaces);
  const selectedSpace = useSpaceStore((s) => s.selectedSpace);

  // Until the first fetch resolves there is nothing meaningful to show.
  if (!mounted || !me) return null;

  const current = spaces.find((s) => s.ownerSub === selectedSpace);
  const isOwnSpace = selectedSpace === me.sub;

  function labelFor(ownerEmail: string, role: 'owner' | 'viewer') {
    if (role === 'owner') return 'Meu workspace';
    return `${ownerEmail} (viewer)`;
  }

  const currentLabel = current
    ? labelFor(current.ownerEmail, current.role)
    : 'Meu workspace';

  function handleSelect(ownerSub: string) {
    useSpaceStore.getState().selectSpace(ownerSub);
  }

  const trigger = isCollapsed ? (
    <Tooltip label={currentLabel} position="right" withArrow>
      <button
        className="flex items-center justify-center w-9 h-9 rounded-md text-[#C7C7CC] hover:bg-white/8 hover:text-white transition-colors"
        aria-label={`Espaco atual: ${currentLabel}`}
      >
        {isOwnSpace ? <IconUser size={16} /> : <IconUsers size={16} />}
      </button>
    </Tooltip>
  ) : (
    <button
      className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-[13px] text-[#C7C7CC] hover:bg-white/8 hover:text-white transition-colors text-left"
      aria-label="Trocar de espaco"
    >
      {isOwnSpace ? (
        <IconUser size={15} className="flex-shrink-0" />
      ) : (
        <IconUsers size={15} className="flex-shrink-0" />
      )}
      <span className="flex-1 min-w-0 truncate">{currentLabel}</span>
      <IconChevronDown size={14} className="flex-shrink-0 opacity-70" />
    </button>
  );

  return (
    <Menu position={isCollapsed ? 'right-start' : 'bottom-start'} width={220} withArrow shadow="md">
      <Menu.Target>{trigger}</Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Espaco</Menu.Label>
        {spaces.map((space) => {
          const isSelected = space.ownerSub === selectedSpace;
          return (
            <Menu.Item
              key={space.ownerSub}
              leftSection={
                space.role === 'owner'
                  ? <IconUser size={14} />
                  : <IconUsers size={14} />
              }
              rightSection={isSelected ? <IconCheck size={14} /> : undefined}
              onClick={() => handleSelect(space.ownerSub)}
            >
              {labelFor(space.ownerEmail, space.role)}
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}
