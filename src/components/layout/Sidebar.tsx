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
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Zustand store ────────────────────────────────────────────────────────────
interface SidebarStore {
  collapsed: boolean;
  toggle: () => void;
}

const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((s) => ({ collapsed: !s.collapsed })),
    }),
    { name: 'cc-sidebar-collapsed' }
  )
);

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
  const { collapsed, toggle } = useSidebarStore();

  return (
    <aside
      className="h-full bg-[#1F1F24] flex flex-col flex-shrink-0 transition-[width] duration-200 ease-in-out overflow-hidden"
      style={{ width: collapsed ? 56 : 240 }}
    >
      {/* Logo + toggle */}
      <div className={`flex items-center py-4 flex-shrink-0 ${collapsed ? 'flex-col gap-3 px-0' : 'px-4 gap-0'}`}>
        {/* Logo */}
        <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center w-full' : 'flex-1 min-w-0'}`}>
          <div className="w-7 h-7 rounded-md bg-blue-500 flex items-center justify-center flex-shrink-0">
            <IconStack2 size={16} color="white" />
          </div>
          {!collapsed && (
            <span className="text-white text-[13px] font-semibold tracking-tight truncate">Control Center</span>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={toggle}
          className={`text-[#C7C7CC] hover:text-white transition-colors flex-shrink-0 ${
            collapsed ? 'flex items-center justify-center w-full py-0.5' : ''
          }`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <IconLayoutSidebarLeftExpand size={18} />
            : <IconLayoutSidebarLeftCollapse size={18} />
          }
        </button>
      </div>

      <div className="mx-3 h-px bg-white/8 flex-shrink-0" />

      {/* Global nav */}
      <nav className="px-2 pt-3 pb-1 flex flex-col gap-0.5 flex-shrink-0">
        {globalNavItems.map(({ label, icon: Icon }) => {
          const btn = (
            <button
              key={label}
              className={`flex items-center rounded-md text-[13px] text-[#C7C7CC] hover:bg-white/8 hover:text-white transition-colors text-left w-full ${
                collapsed ? 'justify-center p-2' : 'gap-2.5 px-2 py-1.5'
              }`}
            >
              <Icon size={15} />
              {!collapsed && label}
            </button>
          );

          if (collapsed) {
            return (
              <Tooltip key={label} label={label} position="right" withArrow>
                {btn}
              </Tooltip>
            );
          }
          return btn;
        })}
      </nav>

      {!collapsed && <div className="mx-3 my-2 h-px bg-white/8 flex-shrink-0" />}
      {collapsed && <div className="mx-3 my-2 h-px bg-white/8 flex-shrink-0" />}

      {/* Projects section label */}
      {!collapsed && (
        <div className="px-4 mb-1 flex-shrink-0">
          <span className="text-[10px] font-semibold text-[#C7C7CC]/60 tracking-wider uppercase">Projects</span>
        </div>
      )}

      {/* Project list */}
      <div className="px-2 flex flex-col gap-0.5 overflow-y-auto">
        {projects.map((project) => {
          const isActive = project.id === activeProject.id;

          const projectBtn = (
            <button
              className={`flex items-center w-full rounded-md text-[13px] transition-colors text-left ${
                isActive ? 'bg-white/10 text-white font-medium' : 'text-[#C7C7CC] hover:bg-white/8 hover:text-white'
              } ${collapsed ? 'justify-center p-2' : 'gap-2.5 px-2 py-1.5'}`}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
              {!collapsed && project.name}
            </button>
          );

          return (
            <div key={project.id}>
              {collapsed ? (
                <Tooltip label={project.name} position="right" withArrow>
                  {projectBtn}
                </Tooltip>
              ) : (
                projectBtn
              )}

              {/* Module sub-menu — only in expanded mode */}
              {isActive && !collapsed && (
                <div className="ml-4 mt-0.5 mb-1 flex flex-col gap-0.5 border-l border-white/10 pl-3">
                  {moduleItems.map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] transition-colors text-left w-full ${
                        label === activeModule
                          ? 'bg-white/8 text-white font-medium'
                          : 'text-[#C7C7CC]/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon size={13} />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {!collapsed ? (
        <div className="mt-auto mx-4 mb-4 pt-3 border-t border-white/8 flex-shrink-0">
          <p className="text-[13px] text-white font-medium">Jairo Neto</p>
          <p className="text-[11px] text-[#C7C7CC]/60">jairo.neto@poatek.com</p>
        </div>
      ) : (
        <div className="mt-auto mb-4 flex justify-center flex-shrink-0">
          <Tooltip label="Jairo Neto" position="right" withArrow>
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center cursor-default">
              <span className="text-white text-[10px] font-bold">JN</span>
            </div>
          </Tooltip>
        </div>
      )}
    </aside>
  );
}
