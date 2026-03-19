import { supabase } from "./client";
import type {
  Requirement,
  CreateRequirementDTO,
  UpdateRequirementDTO,
} from "@/domains/requirements/types/requirement";

// ── DB row type ───────────────────────────────────────────────────────────────

interface RequirementRow {
  id: string;
  req_id: string;
  project_id: string;
  type: string;
  title: string;
  description: string | null;
  acceptance_criteria: string | null;
  status: string;
  priority: string;
  category: string | null;
  author: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

function mapRequirement(row: RequirementRow): Requirement {
  return {
    id: row.id,
    reqId: row.req_id,
    projectId: row.project_id,
    type: row.type as Requirement["type"],
    title: row.title,
    description: row.description,
    acceptanceCriteria: row.acceptance_criteria,
    status: row.status as Requirement["status"],
    priority: row.priority as Requirement["priority"],
    category: row.category as Requirement["category"],
    author: row.author,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const SELECT_COLS =
  "id, req_id, project_id, type, title, description, acceptance_criteria, status, priority, category, author, tags, created_at, updated_at";

// ── Queries ───────────────────────────────────────────────────────────────────

export async function listRequirements(projectId: string): Promise<Requirement[]> {
  const { data, error } = await supabase
    .from("requirements")
    .select(SELECT_COLS)
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as RequirementRow[] ?? []).map(mapRequirement);
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function createRequirement(dto: CreateRequirementDTO): Promise<Requirement> {
  const { data, error } = await supabase
    .from("requirements")
    .insert({
      req_id: "",
      project_id: dto.projectId,
      type: dto.type,
      title: dto.title,
      description: dto.description ?? null,
      acceptance_criteria: dto.acceptanceCriteria ?? null,
      status: dto.status ?? "draft",
      priority: dto.priority ?? "medium",
      category: dto.category ?? null,
      author: dto.author ?? null,
      tags: dto.tags ?? [],
    })
    .select(SELECT_COLS)
    .single();

  if (error) throw error;
  return mapRequirement(data as RequirementRow);
}

export async function updateRequirement(
  id: string,
  dto: UpdateRequirementDTO
): Promise<Requirement> {
  const patch: Record<string, unknown> = {};
  if (dto.title !== undefined) patch.title = dto.title;
  if (dto.description !== undefined) patch.description = dto.description;
  if (dto.acceptanceCriteria !== undefined) patch.acceptance_criteria = dto.acceptanceCriteria;
  if (dto.status !== undefined) patch.status = dto.status;
  if (dto.priority !== undefined) patch.priority = dto.priority;
  if (dto.category !== undefined) patch.category = dto.category;
  if (dto.author !== undefined) patch.author = dto.author;
  if (dto.tags !== undefined) patch.tags = dto.tags;

  const { data, error } = await supabase
    .from("requirements")
    .update(patch)
    .eq("id", id)
    .select(SELECT_COLS)
    .single();

  if (error) throw error;
  return mapRequirement(data as RequirementRow);
}

export async function deleteRequirement(id: string): Promise<void> {
  const { error } = await supabase.from("requirements").delete().eq("id", id);
  if (error) throw error;
}
