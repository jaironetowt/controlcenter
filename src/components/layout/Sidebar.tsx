'use client';

import { flushSync } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  IconClock,
  IconStack2,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconPlus,
  IconPencil,
  IconSettings,
  IconSettings2,
  IconChevronDown,
  IconChevronRight,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { create } from 'zustand';
import { useProjectsStore, type Project } from '@/stores/useProjectsStore';
import { ProjectModal } from '@/components/projects/ProjectModal';

// ─── Zustand store ────────────────────────────────────────────────────────────
interface SidebarStore {
  collapsed: boolean;
  toggle: () => void;
}

const useSidebarStore = create<SidebarStore>()((set) => ({
  collapsed: false,
  toggle: () => set((s) => ({ collapsed: !s.collapsed })),
}));

// ─── Nav config ───────────────────────────────────────────────────────────────

function getModuleItems(projectId: string) {
  return [
    { label: 'Dashboard',    href: `/projects/${projectId}`,              icon: IconLayoutDashboard },
    { label: 'Risks',        href: `/projects/${projectId}/risks`,        icon: IconAlertTriangle   },
    { label: 'Decisions',    href: `/projects/${projectId}/decisions`,    icon: IconNotes           },
    { label: 'Action Items', href: `/projects/${projectId}/actions`,      icon: IconChecklist       },
    { label: 'Stakeholders', href: `/projects/${projectId}/stakeholders`, icon: IconUsers           },
    { label: 'Timecards',   href: `/projects/${projectId}/timecards`,    icon: IconClock           },
    { label: 'Metrics',     href: null,                                   icon: IconChartBar        },
    { label: 'Knowledge',    href: null,                                   icon: IconBook            },
    { label: 'Reports',      href: null,                                   icon: IconFileText        },
    { label: 'Settings',     href: `/projects/${projectId}/settings`,      icon: IconSettings2       },
  ];
}

const globalNavItems = [
  { label: 'All Projects', href: '/global',  icon: IconLayoutDashboard },
  { label: 'Action Items', href: '/global/actions', icon: IconChecklist },
  { label: 'Alerts',       href: null,       icon: IconBell            },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function Sidebar() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { collapsed, toggle } = useSidebarStore();
  const pathname = usePathname();
  const router = useRouter();

  const storeProjects = useProjectsStore((s) => s.projects);
  const projects = mounted ? storeProjects.filter((p) => !p.archived) : [];

  // Derive active project from current URL, fall back to first project
  const urlProjectId = pathname.match(/^\/projects\/([^/]+)/)?.[1] ?? null;
  const activeProject = mounted
    ? (urlProjectId ? projects.find((p) => p.id === urlProjectId) ?? projects[0] ?? null : projects[0] ?? null)
    : null;

  // Which projects have their sub-menu expanded
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  function toggleProjectMenu(id: string) {
    setExpandedProjects((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  // flushSync commits the state to the DOM synchronously (CSS transition engine sees the
  // "before" state), then a single rAF fires after the browser paints that frame,
  // at which point the transition is already running and navigation can fire safely.
  function handleProjectNavigate(project: Project) {
    flushSync(() => {
      setExpandedProjects(() => {
        const next: Record<string, boolean> = {};
        projects.forEach((p) => { next[p.id] = p.id === project.id; });
        return next;
      });
    });
    requestAnimationFrame(() => {
      router.push(`/projects/${project.id}`);
    });
  }

  // A project's sub-menu is open if explicitly set, otherwise falls back to URL match
  function isMenuOpen(project: Project) {
    if (expandedProjects[project.id] !== undefined) return expandedProjects[project.id];
    return activeProject?.id === project.id;
  }

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);

  function openCreateModal() { setEditingProject(undefined); setModalOpen(true); }
  function openEditModal(project: Project) { setEditingProject(project); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditingProject(undefined); }

  const isCollapsed = mounted ? collapsed : false;
  const transitionClass = mounted ? 'transition-[width] duration-200 ease-in-out' : '';
  const labelCls = `overflow-hidden whitespace-nowrap transition-[opacity,max-width] duration-150 ease-in-out ${
    isCollapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-full'
  }`;

  return (
    <div className={`relative h-full flex-shrink-0 ${transitionClass}`} style={{ width: isCollapsed ? 56 : 240 }}>
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

      <aside className="w-full h-full bg-[#1F1F24] flex flex-col overflow-hidden">
        {/* Logo + toggle */}
        <div className={`flex items-center py-4 flex-shrink-0 ${isCollapsed ? 'justify-center px-0' : 'px-4 gap-0'}`}>
          <Link href="/global" className={`flex items-center gap-2.5 ${isCollapsed ? 'justify-center' : 'flex-1 min-w-0'}`}>
            <div className="w-7 h-7 rounded-md bg-blue-500 flex items-center justify-center flex-shrink-0">
              <IconStack2 size={16} color="white" />
            </div>
            <span className={`text-white text-[14px] font-semibold tracking-tight truncate ${labelCls}`}>
              Control Center
            </span>
          </Link>
          {!isCollapsed && (
            <button onClick={toggle} className="text-[#C7C7CC] hover:text-white transition-colors flex-shrink-0" aria-label="Collapse sidebar">
              <IconLayoutSidebarLeftCollapse size={18} />
            </button>
          )}
        </div>

        <div className="mx-3 h-px bg-white/8 flex-shrink-0" />

        {/* Global nav */}
        <nav className="px-2 pt-3 pb-1 flex flex-col gap-0.5 flex-shrink-0">
          {globalNavItems.map(({ label, href, icon: Icon }) => {
            const isActive = href ? pathname === href : false;
            const btn = href ? (
              <Link
                key={label}
                href={href}
                className={`flex items-center rounded-md text-[13px] transition-colors text-left w-full ${
                  isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-2 py-1.5'
                } ${isActive ? 'bg-white/10 text-white' : 'text-[#C7C7CC] hover:bg-white/8 hover:text-white'}`}
              >
                <Icon size={15} className="flex-shrink-0" />
                <span className={labelCls}>{label}</span>
              </Link>
            ) : (
              <button
                key={label}
                disabled
                className={`flex items-center rounded-md text-[13px] text-[#C7C7CC]/40 text-left w-full cursor-not-allowed ${
                  isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-2 py-1.5'
                }`}
              >
                <Icon size={15} className="flex-shrink-0" />
                <span className={labelCls}>{label}</span>
              </button>
            );

            if (isCollapsed) {
              return <Tooltip key={label} label={label} position="right" withArrow>{btn}</Tooltip>;
            }
            return <span key={label}>{btn}</span>;
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
            const isActive = activeProject?.id === project.id;
            const menuOpen = isMenuOpen(project);
            const moduleItems = getModuleItems(project.id);

            const projectBtn = (
              <ProjectRow
                key={project.id}
                project={project}
                isActive={isActive}
                isCollapsed={isCollapsed}
                labelCls={labelCls}
                menuOpen={menuOpen}
                onToggleMenu={() => toggleProjectMenu(project.id)}
                onNavigate={() => handleProjectNavigate(project)}
                onEditClick={() => openEditModal(project)}
              />
            );

            return (
              <div key={project.id}>
                {isCollapsed ? (
                  <Tooltip label={project.name} position="right" withArrow>{projectBtn}</Tooltip>
                ) : (
                  projectBtn
                )}

                {/* Module sub-menu — grid-template-rows transition for smooth real-height animation */}
                <div
                  className="ml-4 border-l border-white/10 pl-3"
                  style={{
                    display: 'grid',
                    gridTemplateRows: !isCollapsed && menuOpen ? '1fr' : '0fr',
                    opacity: !isCollapsed && menuOpen ? 1 : 0,
                    transition: 'grid-template-rows 200ms ease-in-out, opacity 150ms ease-in-out',
                    marginTop: !isCollapsed && menuOpen ? '2px' : 0,
                    marginBottom: !isCollapsed && menuOpen ? '4px' : 0,
                  }}
                >
                  <div style={{ overflow: 'hidden', minHeight: 0 }}>
                  <div className="flex flex-col gap-0.5 py-0.5">
                  {moduleItems.map(({ label, href, icon: Icon }) => {
                    const isModuleActive = href ? pathname === href : false;
                    if (href) {
                      return (
                        <Link
                          key={label}
                          href={href}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] transition-colors text-left w-full ${
                            isModuleActive
                              ? 'bg-white/8 text-white font-medium'
                              : 'text-[#C7C7CC]/70 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon size={13} className="flex-shrink-0" />
                          <span className="whitespace-nowrap">{label}</span>
                        </Link>
                      );
                    }
                    return (
                      <button
                        key={label}
                        disabled
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] text-[#C7C7CC]/30 text-left w-full cursor-not-allowed"
                      >
                        <Icon size={13} className="flex-shrink-0" />
                        <span className="whitespace-nowrap">{label}</span>
                      </button>
                    );
                  })}
                  </div>
                  </div>
                </div>
              </div>
            );
          })}

          {!isCollapsed && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1 px-2 py-1.5 mt-1 rounded-md text-[12px] text-[#C7C7CC]/60 hover:text-[#C7C7CC] transition-colors text-left w-full"
            >
              <IconPlus size={11} className="flex-shrink-0" />
              <span>New Project</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto flex-shrink-0">
          <div className="mx-3 mb-2 h-px bg-white/8" />

          {/* Settings link */}
          <div className="px-2 mb-2">
            {isCollapsed ? (
              <Tooltip label="Settings" position="right" withArrow>
                <Link
                  href="/settings"
                  className={`flex items-center justify-center rounded-md p-2 text-[13px] transition-colors w-full ${
                    pathname === '/settings' ? 'bg-white/10 text-white' : 'text-[#C7C7CC] hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <IconSettings size={15} />
                </Link>
              </Tooltip>
            ) : (
              <Link
                href="/settings"
                className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] transition-colors w-full ${
                  pathname === '/settings' ? 'bg-white/10 text-white' : 'text-[#C7C7CC] hover:bg-white/8 hover:text-white'
                }`}
              >
                <IconSettings size={15} className="flex-shrink-0" />
                <span className={labelCls}>Settings</span>
              </Link>
            )}
          </div>

          <div className={`mx-4 mb-4 pt-3 border-t border-white/8 overflow-hidden transition-[opacity,max-height] duration-150 ${isCollapsed ? 'opacity-0 max-h-0 pointer-events-none' : 'opacity-100 max-h-20'}`}>
            <p className="text-[13px] text-white font-medium whitespace-nowrap">Jairo Neto</p>
            <p className="text-[11px] text-[#C7C7CC]/60 whitespace-nowrap">jairo.neto@poatek.com</p>
          </div>
          <div className={`mb-4 flex justify-center transition-opacity duration-150 ${isCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <Tooltip label="Jairo Neto" position="right" withArrow>
              <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center cursor-default">
                <span className="text-white text-[10px] font-bold">JN</span>
              </div>
            </Tooltip>
          </div>
        </div>
      </aside>

      <ProjectModal opened={modalOpen} onClose={closeModal} project={editingProject} />
    </div>
  );
}

// ─── ProjectRow ───────────────────────────────────────────────────────────────

interface ProjectRowProps {
  project: Project;
  isActive: boolean;
  isCollapsed: boolean;
  labelCls: string;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onNavigate: () => void;
  onEditClick: () => void;
}

function ProjectRow({ project, isActive, isCollapsed, labelCls, menuOpen, onToggleMenu, onNavigate, onEditClick }: ProjectRowProps) {
  const [hovered, setHovered] = useState(false);

  const ChevronIcon = menuOpen ? IconChevronDown : IconChevronRight;

  return (
    <div
      className={`flex items-center w-full rounded-md text-[13px] transition-colors ${
        isActive ? 'bg-white/10 text-white font-medium' : 'text-[#C7C7CC] hover:bg-white/8 hover:text-white'
      } ${isCollapsed ? 'justify-center p-2' : 'gap-2 px-2 py-1.5'}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Color dot — click toggles sub-menu */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleMenu(); }}
        className="relative flex items-center justify-center flex-shrink-0 rounded-full group/dot"
        style={{ width: 16, height: 16 }}
        aria-label={menuOpen ? 'Collapse project menu' : 'Expand project menu'}
      >
        <span
          className="rounded-full block transition-opacity group-hover/dot:opacity-0"
          style={{ width: 8, height: 8, backgroundColor: project.color, position: 'absolute' }}
        />
        <ChevronIcon
          size={14}
          stroke={2.5}
          className="opacity-0 group-hover/dot:opacity-100 transition-opacity"
          style={{ position: 'absolute' }}
        />
      </button>

      {/* Project name — click navigates */}
      <span
        role="button"
        tabIndex={0}
        onClick={onNavigate}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate(); }}
        className={`${labelCls} flex-1 min-w-0 text-left cursor-pointer`}
      >
        {project.name}
      </span>

      {/* Edit pencil */}
      {!isCollapsed && (
        <button
          aria-label={`Edit ${project.name}`}
          onClick={(e) => { e.stopPropagation(); onEditClick(); }}
          className={`flex-shrink-0 flex items-center justify-center text-[#C7C7CC]/60 hover:text-white transition-all cursor-pointer rounded ${
            hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{ width: 20, height: 20 }}
        >
          <IconPencil size={14} />
        </button>
      )}
    </div>
  );
}
