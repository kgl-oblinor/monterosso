import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Undo2,
} from "lucide-react";

import { cn } from "@/lib/utils";

/** Rich-text email body editor (TipTap). Emits HTML on every change. The editing
 *  surface is light to match the actual email card (WYSIWYG). */
export function EmailComposer({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "email-prose min-h-[260px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sync the editor when `value` changes EXTERNALLY (loading a draft, or clearing after a
  // send). While typing, onUpdate keeps value === editor.getHTML(), so this is a no-op and
  // never clobbers the cursor.
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Lenke (URL):", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="overflow-hidden rounded-md border border-white/10 bg-white/[0.04]">
      {/* Toolbar (dark, matches admin) */}
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 bg-white/[0.03] px-2 py-1.5">
        <ToolBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Fet">
          <Bold className="size-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Kursiv">
          <Italic className="size-4" />
        </ToolBtn>
        <Divider />
        <ToolBtn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Overskrift">
          <Heading2 className="size-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Underoverskrift">
          <Heading3 className="size-4" />
        </ToolBtn>
        <Divider />
        <ToolBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Punktliste">
          <List className="size-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Nummerert liste">
          <ListOrdered className="size-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive("link")} onClick={setLink} title="Lenke">
          <Link2 className="size-4" />
        </ToolBtn>
        <Divider />
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Angre">
          <Undo2 className="size-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Gjør om">
          <Redo2 className="size-4" />
        </ToolBtn>
      </div>

      {/* Editing surface (light = email-like) */}
      <div className="bg-white text-[#243b3f]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolBtn({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-md transition-colors",
        active ? "bg-teal-400/20 text-teal-200" : "text-white/60 hover:bg-white/10 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-white/10" />;
}
