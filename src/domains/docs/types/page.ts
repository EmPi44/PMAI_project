export interface Page {
  id: string;
  projectId: string;
  parentId: string | null;
  title: string;
  content: object | null; // Tiptap JSON doc
  icon: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface PageTreeNode extends Page {
  children: PageTreeNode[];
}

export interface CreatePageDTO {
  projectId: string;
  parentId?: string | null;
  title?: string;
  icon?: string;
  position?: number;
}

export interface UpdatePageDTO {
  title?: string;
  content?: object | null;
  icon?: string;
  parentId?: string | null;
  position?: number;
}
