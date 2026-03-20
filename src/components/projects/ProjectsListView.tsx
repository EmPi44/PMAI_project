"use client";

import Link from "next/link";
import { T, FONT_STACK } from "@/lib/tokens";
import type { Project } from "@/domains/projects/types";

interface ProjectsListViewProps {
  projects: Project[];
}

const FALLBACK_GRADIENT = "linear-gradient(135deg, #579DFF 0%, #6554C0 100%)";

function getAvatarBackground(project: Project): string {
  if (project.color) {
    return project.color;
  }
  return FALLBACK_GRADIENT;
}

function ProjectCard({ project }: { project: Project }) {
  const avatarBg = getAvatarBackground(project);
  const initials = project.name.charAt(0).toUpperCase();

  return (
    <Link
      href={`/projects/${project.key}/backlog`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
        className="project-card"
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          padding: 20,
          cursor: "pointer",
          transition: "box-shadow 0.15s ease, transform 0.15s ease",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 4px 16px rgba(9,30,66,0.14), 0 1px 4px rgba(9,30,66,0.08)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            background: avatarBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 700,
            color: "#FFFFFF",
            flexShrink: 0,
            letterSpacing: "-0.5px",
          }}
        >
          {initials}
        </div>

        {/* Name + Key */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: T.text,
              lineHeight: "20px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {project.name}
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {/* Key badge */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 7px",
                borderRadius: 4,
                background: T.brandSubtle,
                color: T.brandBold,
                fontSize: 11,
                fontWeight: 600,
                fontFamily: '"SFMono-Regular", "Consolas", "Liberation Mono", Menlo, monospace',
                letterSpacing: "0.03em",
                lineHeight: "16px",
              }}
            >
              {project.key}
            </span>

            {/* Type */}
            {project.type && (
              <span
                style={{
                  fontSize: 12,
                  color: T.textSubtlest,
                  lineHeight: "16px",
                  textTransform: "capitalize",
                }}
              >
                {project.type}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: T.textSubtle,
              lineHeight: "18px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {project.description}
          </p>
        )}
      </div>
    </Link>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 48,
        minHeight: 320,
      }}
    >
      {/* Illustration placeholder */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: T.bgNeutral,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          marginBottom: 4,
        }}
      >
        📋
      </div>

      <div style={{ textAlign: "center", maxWidth: 320 }}>
        <p
          style={{
            margin: "0 0 6px 0",
            fontSize: 18,
            fontWeight: 600,
            color: T.text,
            lineHeight: "24px",
          }}
        >
          No projects yet
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: T.textSubtle,
            lineHeight: "20px",
          }}
        >
          Create your first project to get started organizing work with AI-powered workflows.
        </p>
      </div>

      <button
        onClick={onCreateClick}
        style={{
          marginTop: 8,
          padding: "8px 18px",
          background: T.brandBold,
          color: T.textInverse,
          border: "none",
          borderRadius: 4,
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: FONT_STACK,
          transition: "background 0.12s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = T.brandBoldHover;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = T.brandBold;
        }}
      >
        Create your first project
      </button>
    </div>
  );
}

export function ProjectsListView({ projects }: ProjectsListViewProps) {
  const handleCreateClick = () => alert("Coming soon");

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT_STACK,
        background: T.surfaceSunken,
        color: T.text,
        minHeight: 0,
      }}
    >
      {/* Page header */}
      <div
        style={{
          padding: "28px 32px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          borderBottom: `1px solid ${T.border}`,
          background: T.surface,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              color: T.text,
              lineHeight: "30px",
              letterSpacing: "-0.3px",
            }}
          >
            Projects
          </h1>
          {projects.length > 0 && (
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: 13,
                color: T.textSubtle,
                lineHeight: "18px",
              }}
            >
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <button
          onClick={handleCreateClick}
          style={{
            padding: "7px 16px",
            background: T.brandBold,
            color: T.textInverse,
            border: "none",
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: FONT_STACK,
            display: "flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
            transition: "background 0.12s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = T.brandBoldHover;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = T.brandBold;
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
            style={{ flexShrink: 0 }}
          >
            <path
              d="M7 1v12M1 7h12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Create project
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "28px 32px", overflow: "auto" }}>
        {projects.length === 0 ? (
          <EmptyState onCreateClick={handleCreateClick} />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
