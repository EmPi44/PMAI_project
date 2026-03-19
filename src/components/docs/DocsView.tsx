"use client";

import { useState, useCallback, useMemo } from "react";
import { T } from "@/lib/tokens";
import type { Page, PageTreeNode } from "@/domains/docs/types/page";
import { usePages, useCreatePage, useUpdatePage, useDeletePage } from "@/domains/docs";
import { PageTree } from "./PageTree";
import { PageEditor } from "./PageEditor";
import { ProjectDocuments } from "./ProjectDocuments";

// TODO: replace with project context once multi-project routing is in place
const PROJECT_ID = "b92e50cc-2022-43d6-9f3c-3cd85813f777";

function buildTree(pages: Page[]): PageTreeNode[] {
  const map = new Map<string, PageTreeNode>();
  const roots: PageTreeNode[] = [];

  for (const page of pages) {
    map.set(page.id, { ...page, children: [] });
  }

  for (const node of map.values()) {
    if (node.parentId) {
      const parent = map.get(node.parentId);
      if (parent) parent.children.push(node);
      else roots.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function DocsView() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Optimistic title overrides - live as user types, before DB round-trip
  const [titleOverrides, setTitleOverrides] = useState<Record<string, string>>({});

  const { data: pages = [], isLoading } = usePages(PROJECT_ID);
  const createPage = useCreatePage(PROJECT_ID);
  const updatePage = useUpdatePage(PROJECT_ID);
  const deletePage = useDeletePage(PROJECT_ID);

  // Merge optimistic title overrides into the pages list for the tree
  const pagesWithOverrides = useMemo(
    () => pages.map((p) => (titleOverrides[p.id] ? { ...p, title: titleOverrides[p.id] } : p)),
    [pages, titleOverrides]
  );

  const tree = useMemo(() => buildTree(pagesWithOverrides), [pagesWithOverrides]);

  const selectedPage = pages.find((p) => p.id === selectedId) ?? null;

  const handleAddPage = useCallback(
    async (parentId: string | null) => {
      const page = await createPage.mutateAsync({
        projectId: PROJECT_ID,
        parentId,
        title: "Untitled",
        icon: "📄",
        position: 0,
      });
      setSelectedId(page.id);
    },
    [createPage]
  );

  const handleSave = useCallback(
    async (id: string, title: string, content: object): Promise<void> => {
      // Clear optimistic override once saved to DB
      setTitleOverrides((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await updatePage.mutateAsync({ id, dto: { title, content } });
    },
    [updatePage]
  );

  const handleIconChange = useCallback(
    (id: string, icon: string) => {
      updatePage.mutate({ id, dto: { icon } });
    },
    [updatePage]
  );

  const handleTitleChange = useCallback(
    (id: string, title: string) => {
      setTitleOverrides((prev) => ({ ...prev, [id]: title }));
    },
    []
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const remaining = pages.filter((p) => p.id !== id);
      setSelectedId(remaining[0]?.id ?? null);
      await deletePage.mutateAsync(id);
    },
    [deletePage, pages]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-1" style={{ color: T.textSubtle, fontSize: 14 }}>
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-full overflow-hidden" style={{ background: T.surface }}>
      {/* Sidebar: page tree + project documents */}
      <div
        className="flex flex-col shrink-0"
        style={{ width: 240, borderRight: `1px solid ${T.borderSubtle}`, background: T.surfaceSunken, overflow: "hidden" }}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          <PageTree
            tree={tree}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAddChild={handleAddPage}
            onDelete={handleDelete}
          />
        </div>
        <ProjectDocuments projectId={PROJECT_ID} />
      </div>

      {/* Editor */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {selectedPage ? (
          <PageEditor
            key={selectedPage.id}
            page={selectedPage}
            onSave={handleSave}
            onIconChange={handleIconChange}
            onTitleChange={handleTitleChange}
            onDelete={handleDelete}
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center flex-1"
            style={{ color: T.textSubtle, fontSize: 14, gap: 12 }}
          >
            <span style={{ fontSize: 48 }}>📄</span>
            <span style={{ color: T.textSubtlest }}>
              {tree.length === 0 ? "No pages yet." : "Select a page to view or edit it."}
            </span>
            <button
              onClick={() => handleAddPage(null)}
              style={{
                marginTop: 4,
                padding: "6px 16px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                background: T.brandBold,
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              + New page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
