import { Clipboard, Save, Camera, PackagePlus } from "lucide-react";
import { useStore } from "../../store";
import { formatters, formatExtensions } from "../../lib/formatters";
import type { TextOutputFormat } from "../../types/domain";
import { copyToClipboard, saveDialog, writeTextFile, saveSnapshot, pickDirectory } from "../../ipc/commands";
import Button from "../common/Button";

const basename = (p: string): string => p.split(/[\\/]/).filter(Boolean).pop() ?? p;

export default function ExportBar() {
  const format = useStore((s) => s.format);
  const addToast = useStore((s) => s.addToast);
  const options = useStore((s) => s.options);
  const root = useStore((s) => s.root);
  const nodes = useStore((s) => s.nodes);
  const childIndex = useStore((s) => s.childIndex);
  const customOrder = useStore((s) => s.customOrder);
  const rootId = useStore((s) => s.rootId);
  const checked = useStore((s) => s.checked);
  const comments = useStore((s) => s.comments);

  const getText = (): string => {
    if (!rootId) return "";
    if (format === "treemap") return "";
    return formatters[format]({ nodes, childIndex, customOrder, checked, comments, rootId, options });
  };

  const onCopy = async () => {
    const t = getText();
    if (!t) return;
    await copyToClipboard(t);
    addToast({ type: "success", message: "Copied to clipboard" });
  };

  const onSave = async () => {
    const text = getText();
    if (!text) return;
    const ext = format === "treemap" ? "txt" : formatExtensions[format as TextOutputFormat];
    const path = await saveDialog(`zdirmap.${ext}`);
    if (!path) return;
    try {
      await writeTextFile(path, text);
      addToast({ type: "success", message: `Saved to ${basename(path)}` });
    } catch (e: any) {
      addToast({ type: "error", message: e?.message ?? "Save failed" });
    }
  };

  const onExportAll = async () => {
    if (!rootId) return;
    const dir = await pickDirectory();
    if (!dir) return;
    const base = (root ? basename(root) : "zdirmap").replace(/[^a-zA-Z0-9_-]/g, "_");
    const ctx = { nodes, childIndex, customOrder, checked, comments, rootId, options };
    const all = Object.keys(formatters) as TextOutputFormat[];
    try {
      for (const fmt of all) {
        const text = formatters[fmt](ctx);
        const sep = dir.includes("\\") ? "\\" : "/";
        await writeTextFile(`${dir}${sep}${base}.${fmt}.${formatExtensions[fmt]}`, text);
      }
      addToast({ type: "success", message: `Exported ${all.length} files to ${basename(dir)}` });
    } catch (e: any) {
      addToast({ type: "error", message: e?.message ?? "Export failed" });
    }
  };

  const onSnapshot = async () => {
    if (!root || !rootId) return;
    const id = crypto.randomUUID();
    const snap = {
      version: 1,
      id,
      name: `${basename(root) || "snapshot"}-${new Date().toISOString().slice(0, 10)}`,
      createdAt: Math.floor(Date.now() / 1000),
      root,
      outputFormat: format,
      outputOptions: options,
      selection: {
        checked: [...checked],
        comments: Object.fromEntries(comments),
      },
      nodes: [...nodes.values()],
    };
    try {
      const file = await saveSnapshot(snap);
      addToast({ type: "success", message: `Snapshot saved: ${basename(file)}` });
    } catch (e: any) {
      addToast({ type: "error", message: e?.message ?? "Snapshot failed" });
    }
  };

  const disabled = format === "treemap" || !rootId;

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <Button variant="subtle" size="sm" icon={<Clipboard size={11} />} onClick={onCopy} disabled={disabled} title="Copy">
        <span className="hidden xl:inline">Copy</span>
      </Button>
      <Button variant="subtle" size="sm" icon={<Save size={11} />} onClick={onSave} disabled={disabled} title="Save">
        <span className="hidden xl:inline">Save</span>
      </Button>
      <Button variant="subtle" size="sm" icon={<PackagePlus size={11} />} onClick={onExportAll} disabled={!rootId} title="Export all formats">
        <span className="hidden xl:inline">Export all</span>
      </Button>
      <Button variant="subtle" size="sm" icon={<Camera size={11} />} onClick={onSnapshot} disabled={!rootId} title="Save snapshot">
        <span className="hidden xl:inline">Snapshot</span>
      </Button>
    </div>
  );
}
