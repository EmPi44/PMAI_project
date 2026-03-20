import { supabase } from "./client";
import type { Project, ProjectCharter } from "@/domains/projects/types";

interface ProjectRow {
  id: string;
  key: string;
  name: string;
  type: string;
  description: string | null;
  avatar_url: string | null;
  color: string | null;
  charter: ProjectCharter;
}

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    type: row.type,
    description: row.description ?? "",
    avatarUrl: row.avatar_url,
    color: row.color,
    charter: row.charter ?? ({} as ProjectCharter),
  };
}

export async function listProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, key, name, type, description, avatar_url, color, charter")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data as ProjectRow[] ?? []).map(mapProject);
}

export async function fetchProjectByKey(key: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, key, name, type, description, avatar_url, color, charter")
    .eq("key", key.toUpperCase())
    .is("deleted_at", null)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return mapProject(data as ProjectRow);
}
