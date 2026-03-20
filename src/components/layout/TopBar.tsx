"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { T } from "@/lib/tokens";
import { SearchIcon, FilterIcon, StarIcon } from "@/components/icons";
import { AvatarCircle } from "@/components/ui";
import { getUserSync } from "@/domains/users/services";
import { useCurrentProject } from "@/lib/context/project-context";

export function TopBar() {
  const project = useCurrentProject();
  const currentUser = getUserSync("SC");
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  // segments: ["projects", "NOVA", "backlog"] → last segment is the page name
  const pageName = segments[segments.length - 1] ?? "";
  const pageLabel = pageName.charAt(0).toUpperCase() + pageName.slice(1);

  return (
    <header
      className="flex shrink-0 items-center justify-between"
      style={{
        height: 56,
        padding: "0 24px",
        background: T.surface,
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      {/* Left: breadcrumb + title */}
      <div className="flex items-center gap-4">
        <nav className="flex items-center gap-1" style={{ fontSize: 13, color: T.textSubtlest }} aria-label="Breadcrumb">
          <Link href="/projects" style={{ color: T.textSubtlest, textDecoration: "none", transition: "color 100ms" }} onMouseEnter={(e) => e.currentTarget.style.color = T.brandBold} onMouseLeave={(e) => e.currentTarget.style.color = T.textSubtlest}>Projects</Link>
          <span style={{ margin: "0 2px" }}>/</span>
          <Link href={`/projects/${project.key}`} style={{ color: T.textSubtlest, textDecoration: "none", transition: "color 100ms" }} onMouseEnter={(e) => e.currentTarget.style.color = T.brandBold} onMouseLeave={(e) => e.currentTarget.style.color = T.textSubtlest}>{project.key}</Link>
          <span style={{ margin: "0 2px" }}>/</span>
          <span style={{ fontWeight: 600, color: T.text }}>{pageLabel}</span>
        </nav>
        <span className="cursor-pointer" style={{ color: T.textDisabled, transition: "color 100ms" }} onMouseEnter={(e) => e.currentTarget.style.color = T.textSubtle} onMouseLeave={(e) => e.currentTarget.style.color = T.textDisabled}>
          <StarIcon />
        </span>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          className="flex items-center justify-center rounded cursor-pointer"
          style={{ width: 32, height: 32, color: T.textSubtle, transition: "background 120ms", border: "none", background: "transparent" }}
          onMouseEnter={(e) => e.currentTarget.style.background = T.surfaceHovered}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          aria-label="Search"
        >
          <SearchIcon />
        </button>
        {/* Filter */}
        <button
          className="flex items-center gap-1.5 rounded cursor-pointer"
          style={{
            height: 32,
            padding: "0 10px",
            fontSize: 13,
            fontWeight: 500,
            color: T.textSubtle,
            transition: "background 120ms",
            border: "none",
            background: "transparent",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = T.surfaceHovered}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <FilterIcon /> Filter
        </button>
        {/* Separator */}
        <div style={{ width: 1, height: 20, background: T.border, margin: "0 4px" }} />
        {/* Board/Backlog toggle */}
        <div className="flex overflow-hidden rounded-md" style={{ border: `1px solid ${T.border}` }}>
          <button
            className="cursor-pointer"
            style={{
              padding: "0 12px",
              height: 30,
              fontSize: 13,
              fontWeight: 500,
              color: T.textSubtle,
              background: "transparent",
              transition: "background 100ms",
              border: "none",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = T.surfaceHovered}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            Board
          </button>
          <button
            className="cursor-pointer"
            style={{
              padding: "0 12px",
              height: 30,
              fontSize: 13,
              fontWeight: 600,
              color: T.textInverse,
              background: T.brandBold,
              border: "none",
            }}
          >
            Backlog
          </button>
        </div>
        {/* User avatar */}
        <div style={{ marginLeft: 4 }}>
          <AvatarCircle user={currentUser} size={28} ring />
        </div>
      </div>
    </header>
  );
}
