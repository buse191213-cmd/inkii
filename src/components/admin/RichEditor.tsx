"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useState, useEffect } from "react";

type Props = {
  /** Formularfeld-Name – wird beim Submit übermittelt. */
  name: string;
  /** Initialer HTML-Inhalt (auch reiner Text wird akzeptiert). */
  initial?: string;
  /** Mindesthöhe der Schreibfläche in Pixel. Standard 320. */
  minHeight?: number;
};

/**
 * Schlanker WYSIWYG-Editor auf TipTap-Basis für Produktbeschreibungen.
 * Liefert HTML-Inhalt über ein verstecktes Form-Feld mit dem Namen {name}.
 */
export default function RichEditor({ name, initial = "", minHeight = 320 }: Props) {
  // Hidden input'u state ile bağla — her zaman güncel
  const [html, setHtml] = useState<string>(initial);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: initial,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setHtml(editor.getHTML());
    },
  });

  // Initial değişirse (örn. başka ürün açılınca) editor'u güncelle
  useEffect(() => {
    setHtml(initial);
    if (editor && initial !== editor.getHTML()) {
      editor.commands.setContent(initial || "<p></p>");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  function Btn({
    label,
    title,
    active = false,
    onClick,
  }: {
    label: string;
    title: string;
    active?: boolean;
    onClick: () => void;
  }) {
    return (
      <button
        type="button"
        className={`rt-btn${active ? " on" : ""}`}
        title={title}
        onClick={onClick}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="rt-wrap">
      <div className="rt-toolbar">
        {editor && (
          <>
            <Btn
              label="B"
              title="Fett"
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <Btn
              label="I"
              title="Kursiv"
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
            <span className="rt-sep" />
            <Btn
              label="H2"
              title="Überschrift 2"
              active={editor.isActive("heading", { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            />
            <Btn
              label="H3"
              title="Überschrift 3"
              active={editor.isActive("heading", { level: 3 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            />
            <Btn
              label="¶"
              title="Absatz"
              active={editor.isActive("paragraph")}
              onClick={() => editor.chain().focus().setParagraph().run()}
            />
            <span className="rt-sep" />
            <Btn
              label="• Liste"
              title="Aufzählung"
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
            <Btn
              label="1. Liste"
              title="Nummerierte Liste"
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            />
            <Btn
              label="„ Zitat"
              title="Zitatblock"
              active={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            />
            <span className="rt-sep" />
            <Btn
              label="Link"
              title="Link einfügen"
              active={editor.isActive("link")}
              onClick={() => {
                const prev = (editor.getAttributes("link").href as string) || "";
                const url = prompt("Link-URL", prev);
                if (url === null) return;
                if (url === "") {
                  editor.chain().focus().unsetLink().run();
                } else {
                  editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
                }
              }}
            />
            <Btn
              label="✕"
              title="Formatierung entfernen"
              onClick={() =>
                editor.chain().focus().clearNodes().unsetAllMarks().run()
              }
            />
          </>
        )}
      </div>
      <EditorContent editor={editor} className="rt-content" style={{ minHeight }} />
      <input type="hidden" name={name} value={html} readOnly />
    </div>
  );
}
