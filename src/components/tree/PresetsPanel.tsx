import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sliders, Plus, Trash2, X, Check } from "lucide-react";
import { useStore } from "../../store";
import { listPresets, savePreset, deletePreset } from "../../ipc/commands";

interface Props { open: boolean; onClose: () => void }

export default function PresetsPanel({ open, onClose }: Props) {
  const presets = useStore((s) => s.presets);
  const setPresets = useStore((s) => s.setPresets);
  const setScanOption = useStore((s) => s.setScanOption);
  const addToast = useStore((s) => s.addToast);

  const [name, setName] = useState("");
  const [pattern, setPattern] = useState("");

  useEffect(() => {
    if (open) listPresets().then(setPresets).catch(() => {});
  }, [open]);

  const onAdd = async () => {
    const trimmedName = name.trim();
    const patterns = pattern.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    if (!trimmedName || patterns.length === 0) return;
    try {
      await savePreset({
        id: crypto.randomUUID(),
        name: trimmedName,
        patterns,
        useDefaults: true,
      });
      const next = await listPresets();
      setPresets(next);
      setName("");
      setPattern("");
      addToast({ type: "success", message: `Saved preset “${trimmedName}”` });
    } catch (e: any) {
      addToast({ type: "error", message: e?.message ?? "Save failed" });
    }
  };

  const onApply = (id: string) => {
    const p = presets.find((x) => x.id === id);
    if (!p) return;
    setScanOption("extraGlobs", p.patterns);
    setScanOption("useDefaults", p.useDefaults);
    addToast({ type: "success", message: `Preset “${p.name}” applied` });
    onClose();
  };

  const onDelete = async (id: string) => {
    try {
      await deletePreset(id);
      const next = await listPresets();
      setPresets(next);
    } catch (e: any) {
      addToast({ type: "error", message: e?.message ?? "Delete failed" });
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 z-30"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -360, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -360, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-0 left-0 bottom-0 z-40 w-[380px] flex flex-col"
            style={{
              background: "var(--color-bg-elev)",
              borderRight: "1px solid var(--color-border)",
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <div className="flex items-center gap-2">
                <Sliders size={13} style={{ color: "var(--color-accent-3)" }} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--color-text-muted)" }}>
                  Ignore presets
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-md flex items-center justify-center cursor-default"
                style={{ color: "var(--color-text-subtle)" }}
              >
                <X size={11} />
              </button>
            </div>

            <div className="p-3 flex flex-col gap-2 shrink-0" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Preset name"
                className="h-8 px-2.5 text-[12px] rounded-lg outline-none"
                style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
              />
              <textarea
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Glob patterns, comma- or newline-separated&#10;e.g. *.lock, target/, .turbo"
                rows={3}
                className="px-2.5 py-2 text-[11px] mono rounded-lg outline-none resize-none"
                style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
              />
              <button
                onClick={onAdd}
                disabled={!name.trim() || !pattern.trim()}
                className="h-8 rounded-lg text-[11px] font-medium cursor-default flex items-center justify-center gap-1.5 disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg, var(--color-accent-3), var(--color-accent))",
                  color: "#fff",
                  boxShadow: "0 6px 18px -8px var(--color-cyan-glow)",
                }}
              >
                <Plus size={11} />
                Save preset
              </button>
            </div>

            <div className="flex-1 overflow-auto p-3 flex flex-col gap-2">
              {presets.length === 0 ? (
                <div className="text-[12px] px-3 py-6 text-center" style={{ color: "var(--color-text-subtle)" }}>
                  No presets saved.
                </div>
              ) : (
                presets.map((p) => (
                  <div key={p.id} className="glass p-3 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium truncate" style={{ color: "var(--color-text)" }}>
                        {p.name}
                      </span>
                      <span className="text-[10px] mono" style={{ color: "var(--color-text-subtle)" }}>
                        {p.patterns.length} pattern{p.patterns.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="text-[10px] mono truncate" style={{ color: "var(--color-text-muted)" }}>
                      {p.patterns.join(", ")}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <button
                        onClick={() => onApply(p.id)}
                        className="h-6 px-2 rounded-md text-[10px] font-medium cursor-default flex items-center gap-1"
                        style={{ background: "var(--color-cyan-dim)", color: "var(--color-accent-3)" }}
                      >
                        <Check size={10} />
                        Apply
                      </button>
                      <span className="flex-1" />
                      <button
                        onClick={() => onDelete(p.id)}
                        className="h-6 w-6 rounded-md flex items-center justify-center cursor-default"
                        style={{ color: "var(--color-text-subtle)" }}
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
