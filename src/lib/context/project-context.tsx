"use client";

import { createContext, useContext } from "react";
import type { Project } from "@/domains/projects/types";

interface ProjectContextValue {
  project: Project;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({
  project,
  children,
}: {
  project: Project;
  children: React.ReactNode;
}) {
  return (
    <ProjectContext.Provider value={{ project }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useCurrentProject(): Project {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("useCurrentProject must be used within a ProjectProvider");
  }
  return ctx.project;
}
