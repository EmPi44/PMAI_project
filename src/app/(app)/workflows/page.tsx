import { WorkflowListView } from "@/components/workflows/WorkflowListView";
import { workflows } from "@/components/workflows/data/workflowsRegistry";

export default function WorkflowsPage() {
  return <WorkflowListView workflows={workflows} />;
}
