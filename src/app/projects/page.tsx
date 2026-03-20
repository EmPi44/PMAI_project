import { listProjects } from "@/lib/supabase/projects";
import { ProjectsListView } from "@/components/projects/ProjectsListView";

export default async function ProjectsPage() {
  const projects = await listProjects();
  return <ProjectsListView projects={projects} />;
}
