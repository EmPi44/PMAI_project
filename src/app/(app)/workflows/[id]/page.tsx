import { notFound } from "next/navigation";
import { getWorkflow } from "@/lib/supabase/workflows";
import { WorkflowCanvas } from "@/components/workflows/WorkflowCanvas";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ scenario?: string }>;
}

export default async function WorkflowDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { scenario } = await searchParams;

  const workflow = await getWorkflow(id);
  if (!workflow) notFound();

  return <WorkflowCanvas workflow={workflow} initialScenarioId={scenario} />;
}
