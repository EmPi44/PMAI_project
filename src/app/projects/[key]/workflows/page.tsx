import { WorkflowListView } from "@/components/workflows/WorkflowListView";
import { listWorkflows } from "@/lib/supabase/workflows";
import { fetchProjectByKey } from "@/lib/supabase/projects";

export default async function WorkflowsPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const project = await fetchProjectByKey(key);
  const workflows = project ? await listWorkflows(project.id) : [];
  return <WorkflowListView workflows={workflows} projectId={project?.id ?? ""} />;
}
