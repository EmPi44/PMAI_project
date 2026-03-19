import { supabase } from "./client";
import type { Page, CreatePageDTO, UpdatePageDTO } from "@/domains/docs/types/page";

// ── DB row type ───────────────────────────────────────────────────────────────

interface PageRow {
  id: string;
  project_id: string;
  parent_id: string | null;
  title: string;
  content: object | null;
  icon: string;
  position: number;
  created_at: string;
  updated_at: string;
}

function mapPage(row: PageRow): Page {
  return {
    id: row.id,
    projectId: row.project_id,
    parentId: row.parent_id,
    title: row.title,
    content: row.content,
    icon: row.icon,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Queries ───────────────────────────────────────────────────────────────────

/** Returns all non-deleted pages for a project, ordered by position. */
export async function listPages(projectId: string): Promise<Page[]> {
  const { data, error } = await supabase
    .from("pages")
    .select("id, project_id, parent_id, title, content, icon, position, created_at, updated_at")
    .eq("project_id", projectId)
    .is("deleted_at", null)
    .order("position", { ascending: true });

  if (error) throw error;
  return (data as PageRow[] ?? []).map(mapPage);
}

/** Fetches a single page by ID. */
export async function getPage(id: string): Promise<Page | null> {
  const { data, error } = await supabase
    .from("pages")
    .select("id, project_id, parent_id, title, content, icon, position, created_at, updated_at")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return mapPage(data as PageRow);
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/** Creates a new page and returns it. */
export async function createPage(dto: CreatePageDTO): Promise<Page> {
  const { data, error } = await supabase
    .from("pages")
    .insert({
      project_id: dto.projectId,
      parent_id: dto.parentId ?? null,
      title: dto.title ?? "Untitled",
      icon: dto.icon ?? "📄",
      position: dto.position ?? 0,
    })
    .select("id, project_id, parent_id, title, content, icon, position, created_at, updated_at")
    .single();

  if (error) throw error;
  return mapPage(data as PageRow);
}

/** Updates page fields (title, content, icon, etc.). */
export async function updatePage(id: string, dto: UpdatePageDTO): Promise<Page> {
  const patch: Record<string, unknown> = {};
  if (dto.title !== undefined) patch.title = dto.title;
  if (dto.content !== undefined) patch.content = dto.content;
  if (dto.icon !== undefined) patch.icon = dto.icon;
  if (dto.parentId !== undefined) patch.parent_id = dto.parentId;
  if (dto.position !== undefined) patch.position = dto.position;

  const { data, error } = await supabase
    .from("pages")
    .update(patch)
    .eq("id", id)
    .select("id, project_id, parent_id, title, content, icon, position, created_at, updated_at")
    .single();

  if (error) throw error;
  return mapPage(data as PageRow);
}

/** Soft-deletes a page (and DB CASCADE removes children). */
export async function deletePage(id: string): Promise<void> {
  const { error } = await supabase
    .from("pages")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}
