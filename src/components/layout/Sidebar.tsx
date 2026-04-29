'use client';

import { IconLayoutDashboard, IconAlertTriangle, IconNotes, IconUsers, IconChartBar, IconBook, IconFileText, IconChecklist, IconBell, IconStack2 } from '@tabler/icons-react';

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

const activeProject = projects[0];
const activeModule = 'Dashboard';

export function Sidebar() {
  return (
    <aside className="w-[240px] h-full bg-[#1F1F24] flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="w-7 h-7 rounded-md bg-blue-500 flex items-center justify-center">
          <IconStack2 size={16} color="white" />
        </div>
        <span className="text-white text-[13px] font-semibold tracking-tight">Control Center</span>
      </div>

      <div className="mx-4 h-px bg-white/8" />

      {/* Global nav */}
      <nav className="px-3 pt-3 pb-1 flex flex-col gap-0.5">
        {[
          { label: 'All Projects', icon: IconLayoutDashboard },
          { label: 'Action Items', icon: IconChecklist },
          { label: 'Alerts',       icon: IconBell },
        ].map(({ label, icon: Icon }) => (
          <button
            key={label}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] text-[#C7C7CC] hover:bg-white/8 hover:text-white transition-colors text-left w-full"
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </nav>

      <div className="mx-4 my-2 h-px bg-white/8" />

      {/* Projects */}
      <div className="px-4 mb-1">
        <span className="text-[10px] font-semibold text-[#C7C7CC]/60 tracking-wider uppercase">Projects</span>
      </div>

      <div className="px-3 flex flex-col gap-0.5 overflow-y-auto">
        {projects.map((project) => {
          const isActive = project.id === activeProject.id;
          return (
            <div key={project.id}>
              <button
                className={`flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md text-[13px] transition-colors text-left ${
                  isActive ? 'bg-white/10 text-white font-medium' : 'text-[#C7C7CC] hover:bg-white/8 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                {project.name}
              </button>

              {/* Collapsible modules under active project */}
              {isActive && (
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
      <div className="mt-auto mx-4 mb-4 pt-3 border-t border-white/8">
        <p className="text-[13px] text-white font-medium">Jairo Neto</p>
        <p className="text-[11px] text-[#C7C7CC]/60">jairo.neto@poatek.com</p>
      </div>
    </aside>
  );
}
