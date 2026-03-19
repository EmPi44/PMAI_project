"use client";

import Link from "next/link";
import { T } from "@/lib/tokens";
import {
  TimelineIcon,
  BoardIcon,
  BacklogIcon,
  CalendarIcon,
  ListIcon,
  CodeIcon,
  RocketIcon,
  WorkflowsIcon,
  CollapseIcon,
  SettingsIcon,
} from "@/components/icons";
import { AvatarCircle } from "@/components/ui";
import { getUserSync } from "@/domains/users/services";
import { getProjectSync } from "@/domains/projects/services";

interface NavItem {
  label: string;
  Icon: React.ComponentType;
  href: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV_ITEMS: NavGroup[] = [
  {
    group: "PROJECT",
    items: [
      { label: "Workflows", Icon: WorkflowsIcon, href: "/workflows" },
    ],
  },
  {
    group: "PLANNING",
    items: [
      { label: "Timeline",  Icon: TimelineIcon, href: "/timeline" },
      { label: "Board",     Icon: BoardIcon,    href: "/board" },
      { label: "Backlog",   Icon: BacklogIcon,  href: "/backlog" },
      { label: "Calendar",  Icon: CalendarIcon, href: "/calendar" },
      { label: "List",      Icon: ListIcon,     href: "/list" },
    ],
  },
  {
    group: "DEVELOPMENT",
    items: [
      { label: "Code", Icon: CodeIcon, href: "#" },
    ],
  },
  {
    group: "OPERATIONS",
    items: [
      { label: "Deployments", Icon: RocketIcon, href: "#" },
    ],
  },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  activePath: string;
}

export function Sidebar({ collapsed, onToggle, activePath }: Props) {
  const project = getProjectSync();
  const currentUser = getUserSync("SC");

  return (
    <aside
      className="flex shrink-0 flex-col"
      style={{
        width: collapsed ? 52 : 260,
        background: T.navBg,
        borderRight: `1px solid ${T.navBorder}`,
        transition: "width 180ms cubic-bezier(.4,0,.2,1)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 shrink-0"
        style={{
          height: 56,
          padding: collapsed ? "0 10px" : "0 12px",
          borderBottom: `1px solid ${T.navBorder}`,
        }}
      >
        {/* Project avatar */}
        <span
          className="flex shrink-0 items-center justify-center rounded-md"
          style={{
            width: 32,
            height: 32,
            background: "linear-gradient(135deg, #579DFF 0%, #6554C0 100%)",
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-0.02em",
          }}
        >
          {project.name.charAt(0)}
        </span>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="truncate" style={{ fontSize: 14, fontWeight: 600, color: T.navTextBright, lineHeight: "18px" }}>
              {project.name}
            </div>
            <div className="truncate" style={{ fontSize: 11, color: T.navTextMuted, lineHeight: "14px" }}>
              {project.type}
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="flex shrink-0 items-center justify-center rounded cursor-pointer"
          style={{
            width: 28,
            height: 28,
            color: T.navText,
            transition: "background 120ms, color 120ms",
            border: "none",
            background: "transparent",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = T.navHover; e.currentTarget.style.color = T.navTextBright; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.navText; }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <CollapseIcon collapsed={collapsed} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: "none" }}>
        {NAV_ITEMS.map((group) => (
          <div key={group.group} className="mb-1.5">
            {!collapsed && (
              <div
                style={{
                  padding: "6px 16px 4px",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  color: T.navTextMuted,
                }}
              >
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = activePath === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center cursor-pointer no-underline"
                  style={{
                    gap: collapsed ? 0 : 10,
                    height: 32,
                    padding: collapsed ? "0" : "0 12px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    margin: collapsed ? "1px 6px" : "1px 8px",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? T.navTextBright : T.navText,
                    background: isActive ? "rgba(82,168,255,0.16)" : "transparent",
                    transition: "background 120ms, color 120ms",
                    width: collapsed ? 40 : "calc(100% - 16px)",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = T.navHover; e.currentTarget.style.color = T.navTextBright; } }}
                  onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.navText; } }}
                  title={collapsed ? item.label : undefined}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="flex shrink-0 items-center justify-center" style={{ width: 20, height: 20 }}>
                    <item.Icon />
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && isActive && (
                    <span
                      style={{
                        position: "absolute",
                        left: -8,
                        width: 3,
                        height: 20,
                        borderRadius: "0 2px 2px 0",
                        background: "#579DFF",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="mt-auto flex items-center gap-2.5 shrink-0"
        style={{
          height: 52,
          padding: collapsed ? "0 10px" : "0 12px",
          borderTop: `1px solid ${T.navBorder}`,
        }}
      >
        <AvatarCircle user={currentUser} size={28} />
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate" style={{ fontSize: 13, color: T.navText }}>
              {currentUser?.name}
            </span>
            <button
              className="flex items-center justify-center rounded cursor-pointer"
              style={{ width: 28, height: 28, color: T.navText, transition: "background 120ms, color 120ms", border: "none", background: "transparent" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = T.navHover; e.currentTarget.style.color = T.navTextBright; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.navText; }}
              aria-label="Settings"
            >
              <SettingsIcon />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
