'use client';

import { Tooltip } from '@mantine/core';
import {
  IconLayoutDashboard,
  IconAlertTriangle,
  IconNotes,
  IconUsers,
  IconChartBar,
  IconBook,
  IconFileText,
  IconChecklist,
  IconBell,
  IconStack2,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { create } from 'zustand';
// ─── Zustand store ────────────────────────────────────────────────────────────
interface SidebarStore {
  collapsed: boolean;
  toggle: () => void;
}

const useSidebarStore = create<SidebarStore>()((set) => ({
  collapsed: false,
  toggle: () => set((s) => ({ collapsed: !s.collapsed })),
}));

// ─── Data ─────────────────────────────────────────────────────────────────────
const projects = [
  { id: 'mosaic', name: 'Mosaic', color: '#3E77FC' },
  { id: 'whr', name: 'WHR Redesign', color: '#8B56FC' },
  { id: 'client-x', name: 'Client X', color: '#F59E0B' },
];

const moduleItems = [
  { label: 'Dashboard',    icon: IconLayoutDashboard },
  { label: 'Risks',        icon: IconAlertTriangle   },
  { label: 'Decisions',    icon: IconNotes           },
  { label: 'Action Items', icon: IconChecklist       },
  { label: 'Stakeholders', icon: IconUsers           },
  { label: 'Metrics',      icon: IconChartBar        },
  { label: 'Knowledge',    icon: IconBook            },
  { label: 'Reports',      icon: IconFileText        },
];

const globalNavItems = [
  { label: 'All Projects', icon: IconLayoutDashboard },
  { label: 'Action Items', icon: IconChecklist },
  { label: 'Alerts',       icon: IconBell },
];

const activeProject = projects[0];
const activeModule = 'Dashboard';

// ─── Component ────────────────────────────────────────────────────────────────
export function Sidebar() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { collapsed, toggle } = useSidebarStore();

  // Before hydration, always render expanded (matches SSR default)
  const isCollapsed = mounted ? collapsed : false;

  // Only apply transition after mount to avoid flash
  const transitionClass = mounted ? 'transition-[width] duration-200 ease-in-out' : '';

  // Shared class for text labels that fade/shrink when collapsed
  const labelCls = `overflow-hidden whitespace-nowrap transition-[opacity,max-width] duration-150 ease-in-out ${
    isCollapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-full'
  }`;

  return (
    <div className={`relative h-full flex-shrink-0 ${transitionClass}`} style={{ width: isCollapsed ? 56 : 240 }}>
      {/* Protruding expand tab — only visible when collapsed */}
      {isCollapsed && (
        <button
          onClick={toggle}
          className="absolute z-10 flex items-center justify-center bg-zinc-100 border border-zinc-300 rounded-r-md shadow-sm text-zinc-500 hover:text-zinc-900 hover:bg-white transition-colors"
          style={{ right: -20, top: 16, width: 20, height: 24 }}
          aria-label="Expand sidebar"
        >
          <IconLayoutSidebarLeftExpand size={14} />
        </button>
      )}

      <aside
        className="w-full h-full bg-[#1F1F24] flex flex-col overflow-hidden"
      >
      {/* Logo + toggle */}
      <div className={`flex items-center py-4 flex-shrink-0 ${isCollapsed ? 'justify-center px-0' : 'px-4 gap-0'}`}>
        {/* Logo */}
        <div className={`flex items-center gap-2.5 ${isCollapsed ? 'justify-center' : 'flex-1 min-w-0'}`}>
          <div className="w-7 h-7 rounded-md bg-blue-500 flex items-center justify-center flex-shrink-0">
            <IconStack2 size={16} color="white" />
          </div>
          <span className={`text-white text-[13px] font-semibold tracking-tight truncate ${labelCls}`}>
            Control Center
          </span>
        </div>

        {/* Collapse button — only visible when expanded */}
        {!isCollapsed && (
          <button
            onClick={toggle}
            className="text-[#C7C7CC] hover:text-white transition-colors flex-shrink-0"
            aria-label="Collapse sidebar"
          >
            <IconLayoutSidebarLeftCollapse size={18} />
          </button>
        )}
      </div>

      <div className="mx-3 h-px bg-white/8 flex-shrink-0" />

      {/* Global nav */}
      <nav className="px-2 pt-3 pb-1 flex flex-col gap-0.5 flex-shrink-0">
        {globalNavItems.map(({ label, icon: Icon }) => {
          const btn = (
            <button
              key={label}
              className={`flex items-center rounded-md text-[13px] text-[#C7C7CC] hover:bg-white/8 hover:text-white transition-colors text-left w-full ${
                isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-2 py-1.5'
              }`}
            >
              <Icon size={15} className="flex-shrink-0" />
              <span className={labelCls}>{label}</span>
            </button>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={label} label={label} position="right" withArrow>
                {btn}
              </Tooltip>
            );
          }
          return btn;
        })}
      </nav>

      <div className="mx-3 my-2 h-px bg-white/8 flex-shrink-0" />

      {/* Projects section label */}
      <div className="px-4 mb-1 flex-shrink-0">
        <span className={`text-[10px] font-medium text-[#C7C7CC]/60 tracking-wider uppercase ${labelCls}`}>
          Projects
        </span>
      </div>

      {/* Project list */}
      <div className="px-2 flex flex-col gap-0.5 overflow-y-auto">
        {projects.map((project) => {
          const isActive = project.id === activeProject.id;

          const projectBtn = (
            <button
              className={`flex items-center w-full rounded-md text-[13px] transition-colors text-left ${
                isActive ? 'bg-white/10 text-white font-medium' : 'text-[#C7C7CC] hover:bg-white/8 hover:text-white'
              } ${isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-2 py-1.5'}`}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
              <span className={labelCls}>{project.name}</span>
            </button>
          );

          return (
            <div key={project.id}>
              {isCollapsed ? (
                <Tooltip label={project.name} position="right" withArrow>
                  {projectBtn}
                </Tooltip>
              ) : (
                projectBtn
              )}

              {/* Module sub-menu — only in expanded mode */}
              {isActive && (
                <div
                  className={`ml-4 mt-0.5 mb-1 flex flex-col gap-0.5 border-l border-white/10 pl-3 overflow-hidden transition-[opacity,max-height] duration-150 ease-in-out ${
                    isCollapsed ? 'opacity-0 max-h-0' : 'opacity-100 max-h-96'
                  }`}
                >
                  {moduleItems.map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] transition-colors text-left w-full ${
                        label === activeModule
                          ? 'bg-white/8 text-white font-medium'
                          : 'text-[#C7C7CC]/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon size={13} className="flex-shrink-0" />
                      <span className="whitespace-nowrap">{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-auto flex-shrink-0">
        {/* Expanded footer — always mounted, fades out when collapsed */}
        <div className={`mx-4 mb-4 pt-3 border-t border-white/8 overflow-hidden transition-[opacity,max-height] duration-150 ${isCollapsed ? 'opacity-0 max-h-0 pointer-events-none' : 'opacity-100 max-h-20'}`}>
          <p className="text-[13px] text-white font-medium whitespace-nowrap">Jairo Neto</p>
          <p className="text-[11px] text-[#C7C7CC]/60 whitespace-nowrap">jairo.neto@poatek.com</p>
        </div>
        {/* Collapsed avatar — always mounted, fades in when collapsed */}
        <div className={`mb-4 flex justify-center transition-opacity duration-150 ${isCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <Tooltip label="Jairo Neto" position="right" withArrow>
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center cursor-default">
              <span className="text-white text-[10px] font-bold">JN</span>
            </div>
          </Tooltip>
        </div>
      </div>
      </aside>
    </div>
  );
}
