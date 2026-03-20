import { notFound } from "next/navigation";
import { fetchProjectByKey } from "@/lib/supabase/projects";
import { ProjectProvider } from "@/lib/context/project-context";
import { AppShell } from "@/components/layout/AppShell";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const project = await fetchProjectByKey(key);
  if (!project) notFound();

  return (
    <ProjectProvider project={project}>
      <AppShell projectKey={key}>{children}</AppShell>
    </ProjectProvider>
  );
}
