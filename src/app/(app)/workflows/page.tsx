import { WorkflowListView } from "@/components/workflows/WorkflowListView";
import { listWorkflows } from "@/lib/supabase/workflows";

export default async function WorkflowsPage() {
  const workflows = await listWorkflows();
  return <WorkflowListView workflows={workflows} />;
}
