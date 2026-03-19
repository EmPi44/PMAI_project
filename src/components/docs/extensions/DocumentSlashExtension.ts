import { Extension } from "@tiptap/core";
import { Suggestion } from "@tiptap/suggestion";
import type { Document } from "@/domains/docs/types/document";

export interface PickerState {
  query: string;
  clientRect: (() => DOMRect | null) | null;
  selectDocument: (doc: Document) => void;
}

export interface DocumentSlashOptions {
  documentsRef: { current: Document[] };
  onOpen: (state: PickerState) => void;
  onUpdate: (state: PickerState) => void;
  onClose: () => void;
}

export const DocumentSlashExtension = Extension.create<DocumentSlashOptions>({
  name: "documentSlash",

  addOptions() {
    return {
      documentsRef: { current: [] },
      onOpen: () => {},
      onUpdate: () => {},
      onClose: () => {},
    };
  },

  addProseMirrorPlugins() {
    const options = this.options;

    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        allowSpaces: false,

        items: ({ query }: { query: string }) => {
          const q = query.toLowerCase();
          // Only activate when query looks like "document..." or just "d/do/doc/..."
          const isDocCommand = "document".startsWith(q) || q.startsWith("document");
          if (!isDocCommand) return [];

          const searchStr = q.startsWith("document") ? q.slice(8).trim() : "";
          const docs = options.documentsRef.current;
          if (!searchStr) return docs.slice(0, 8);
          return docs
            .filter((d) => d.name.toLowerCase().includes(searchStr))
            .slice(0, 8);
        },

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        command: ({ editor, range, props }: { editor: any; range: any; props: Document }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent({
              type: "documentLink",
              attrs: {
                documentId: props.id,
                name: props.name,
                fileType: props.fileType,
                storagePath: props.storagePath,
              },
            })
            .insertContent(" ")
            .run();
        },

        render: () => {
          return {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onStart: (props: any) => {
              if (!props.items.length) return;
              options.onOpen({
                query: props.query,
                clientRect: props.clientRect,
                selectDocument: (doc: Document) => props.command(doc),
              });
            },

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onUpdate: (props: any) => {
              if (!props.items.length) {
                options.onClose();
                return;
              }
              options.onUpdate({
                query: props.query,
                clientRect: props.clientRect,
                selectDocument: (doc: Document) => props.command(doc),
              });
            },

            onExit: () => {
              options.onClose();
            },

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onKeyDown: ({ event }: { event: KeyboardEvent }) => {
              return event.key === "Escape";
            },
          };
        },
      }),
    ];
  },
});
