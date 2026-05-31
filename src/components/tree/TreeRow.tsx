import { useState } from "react";
import { ChevronRight, Folder, FolderOpen, FileText, Link2, MessageSquarePlus } from "lucide-react";
import TriStateCheckbox from "./TriStateCheckbox";
import CommentEditor from "./CommentEditor";
import { useStore } from "../../store";
import { stateOf } from "../../lib/tristate";
import { humanSize } from "../../lib/filesize";

export interface RowInfo {
  id: string;
  depth: number;
}

interface Props {
  info: RowInfo;
  style: React.CSSProperties;
}

export default function TreeRow({ info, style }: Props) {
  const node = useStore((s) => s.nodes.get(info.id));
  const expanded = useStore((s) => s.expanded.has(info.id));
  const toggleExp = useStore((s) => s.toggleExpanded);
  const toggleCheck = useStore((s) => s.toggleCheck);
  const checked = useStore((s) => s.checked);
  const partial = useStore((s) => s.partial);
  const showSizes = useStore((s) => s.options.showSizes);
  const showLines = useStore((s) => s.options.showLines);
  const comment = useStore((s) => s.comments.get(info.id));
  const setComment = useStore((s) => s.setComment);
  const reorder = useStore((s) => s.reorder);
  const childIndex = useStore((s) => s.childIndex);
  const customOrder = useStore((s) => s.customOrder);
  const [editing, setEditing] = useState(false);
  const [dropPos, setDropPos] = useState<"before" | "after" | null>(null);

  if (!node) return null;
  const st = stateOf(node.id, checked, partial);
  const Icon = node.isSymlink ? Link2 : node.isDir ? (expanded ? FolderOpen : Folder) : FileText;
  const indent = info.depth * 14;
  const parentId = node.parentId;
  const draggable = parentId != null;

  const onDragStart = (e: React.DragEvent) => {
    if (!parentId) return;
    e.dataTransfer.setData("text/zdm-node", `${parentId}|${node.id}`);
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e: React.DragEvent) => {
    const data = e.dataTransfer.types.includes("text/zdm-node");
    if (!data || !parentId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDropPos(e.clientY - rect.top < rect.height / 2 ? "before" : "after");
  };
  const onDragLeave = () => setDropPos(null);
  const onDrop = (e: React.DragEvent) => {
    const raw = e.dataTransfer.getData("text/zdm-node");
    setDropPos(null);
    if (!raw || !parentId) return;
    const [srcParent, srcId] = raw.split("|");
    if (srcParent !== parentId || srcId === node.id) return;
    const siblings = customOrder.get(parentId) ?? childIndex.get(parentId) ?? [];
    const fromIdx = siblings.indexOf(srcId);
    let toIdx = siblings.indexOf(node.id);
    if (fromIdx < 0 || toIdx < 0) return;
    const before = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const after = e.clientY - before.top < before.height / 2;
    if (!after) toIdx += 1;
    if (fromIdx < toIdx) toIdx -= 1;
    if (fromIdx === toIdx) return;
    reorder(parentId, fromIdx, toIdx);
  };

  return (
    <div
      style={{ ...style, paddingLeft: indent + 8 }}
      className="group flex items-center gap-1.5 px-2 text-[12px] zdm-tree-row"
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      data-drop={dropPos ?? undefined}
    >
      <button
        onClick={() => node.isDir && toggleExp(node.id)}
        className="w-4 h-4 flex items-center justify-center cursor-default shrink-0"
        style={{ color: "var(--color-text-subtle)", opacity: node.isDir ? 1 : 0 }}
      >
        <ChevronRight
          size={11}
          style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 120ms var(--ease-out)" }}
        />
      </button>
      <TriStateCheckbox state={st} onClick={() => toggleCheck(node.id)} />
      <Icon
        size={12}
        style={{ color: node.isDir ? "var(--color-accent-3)" : "var(--color-text-muted)", flexShrink: 0 }}
      />
      <span
        className="truncate"
        style={{ color: st === "unchecked" ? "var(--color-text-muted)" : "var(--color-text)" }}
      >
        {node.name}
      </span>

      {editing ? (
        <CommentEditor
          initial={comment ?? ""}
          onSave={(v) => { setComment(node.id, v); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      ) : comment ? (
        <button
          onClick={() => setEditing(true)}
          className="text-[10px] mono ml-2 truncate max-w-[200px] cursor-default"
          style={{ color: "var(--color-accent-3)" }}
        >
          # {comment}
        </button>
      ) : null}

      <span className="flex-1" />

      {showSizes && (
        <span className="mono text-[10px]" style={{ color: "var(--color-text-subtle)" }}>
          {humanSize(node.size)}
        </span>
      )}

      {showLines && node.lines != null && (
        <span className="mono text-[10px]" style={{ color: "var(--color-text-subtle)" }}>
          {node.lines.toLocaleString()}L
        </span>
      )}

      {!editing && !comment && (
        <button
          onClick={() => setEditing(true)}
          className="zdm-comment-btn w-5 h-5 rounded-md flex items-center justify-center cursor-default opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: "var(--color-text-subtle)" }}
          title="Add comment"
        >
          <MessageSquarePlus size={10} />
        </button>
      )}

      <style>{`
        .zdm-tree-row { position: relative; }
        .zdm-tree-row:hover { background: var(--color-panel); }
        .zdm-tree-row::before {
          content: "";
          position: absolute;
          left: 0; top: 4px; bottom: 4px;
          width: 1.5px;
          background: var(--color-accent-3);
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 120ms var(--ease-out);
        }
        .zdm-tree-row:hover::before { transform: scaleY(1); }
        .zdm-tree-row[data-drop="before"] { box-shadow: inset 0 2px 0 0 var(--color-accent-3); }
        .zdm-tree-row[data-drop="after"] { box-shadow: inset 0 -2px 0 0 var(--color-accent-3); }
      `}</style>
    </div>
  );
}
