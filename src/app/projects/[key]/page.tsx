import { redirect } from "next/navigation";

export default async function ProjectRootPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  redirect(`/projects/${key}/backlog`);
}
