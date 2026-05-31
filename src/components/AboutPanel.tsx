import { motion, AnimatePresence } from "motion/react";
import { X, Github, Globe, FolderTree, Heart, Scale } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";
import Logo from "./common/Logo";

interface Props { open: boolean; onClose: () => void }

const STACK: Array<{ name: string; desc: string }> = [
  { name: "Tauri 2", desc: "Rust-powered native shell + tiny binary footprint" },
  { name: "React 19 + TypeScript", desc: "Frontend with strict typing end-to-end" },
  { name: "Vite 7", desc: "Instant HMR dev server" },
  { name: "Tailwind 4", desc: "Theme tokens + glassmorphic design system" },
  { name: "Zustand 5", desc: "Composed-slice state with shallow selectors" },
  { name: "@tanstack/react-virtual", desc: "Virtualized tree row rendering for huge dirs" },
  { name: "d3-hierarchy", desc: "Squarified treemap layout" },
  { name: "motion (Framer)", desc: "Spring-eased panel and overlay transitions" },
  { name: "walkdir + globset + ignore", desc: "Streaming scan, gitignore parsing, glob matching" },
  { name: "tokio", desc: "Async cancellable background scans" },
];

const FEATURES = [
  "Streaming scan with live progress + cancellation",
  "Tri-state checkboxes with O(depth) propagation",
  "9 output formats: ASCII, Markdown, JSON, YAML, Flat, CSV, HTML, Mermaid, Treemap",
  "WinDirStat-style squarified treemap with drill-in",
  "Snapshots + diff between scans",
  "Saved ignore presets + .gitignore auto-import",
  "Drag-to-reorder, inline comments, virtualized tree",
  "One-click export-all to a directory",
];

export default function AboutPanel({ open, onClose }: Props) {
  const link = (url: string) => openUrl(url).catch(() => {});
  return (
    <AnimatePresence>
      {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }}
            onClick={onClose}
          >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-[640px] max-w-[92vw] max-h-[88vh] flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: "var(--color-bg-elev)",
              border: "1px solid var(--color-border)",
              boxShadow: "0 30px 80px -20px rgba(0,0,0,0.7)",
            }}
          >
            <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <div className="flex items-center gap-3">
                <Logo size={26} />
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold tracking-[0.05em]" style={{ color: "var(--color-text)" }}>
                    ZDirMap
                  </span>
                  <span className="text-[10px] mono" style={{ color: "var(--color-text-subtle)" }}>
                    v0.1.1 · the go-to directory tree tool
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-md flex items-center justify-center cursor-default"
                style={{ color: "var(--color-text-subtle)" }}
              >
                <X size={13} />
              </button>
            </div>

            <div className="flex-1 overflow-auto px-5 py-4 flex flex-col gap-5">
              <section>
                <p className="text-[12.5px] leading-[1.6]" style={{ color: "var(--color-text-muted)" }}>
                  ZDirMap turns any folder into a tree you can <strong style={{ color: "var(--color-text)" }}>navigate, filter, annotate, and export</strong> in 9 different formats — from ASCII art for README files, to interactive HTML, to a WinDirStat-style treemap. Built because the alternatives are either ancient, web-only, or locked behind subscriptions.
                </p>
              </section>

              <section>
                <SectionTitle icon={<FolderTree size={11} />}>What it does</SectionTitle>
                <ul className="flex flex-col gap-1 mt-2">
                  {FEATURES.map((f) => (
                    <li key={f} className="text-[12px] flex gap-2" style={{ color: "var(--color-text-muted)" }}>
                      <span style={{ color: "var(--color-accent-3)" }}>›</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <SectionTitle icon={<Heart size={11} />}>Tech stack</SectionTitle>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
                  {STACK.map((s) => (
                    <div key={s.name} className="text-[11.5px]">
                      <div style={{ color: "var(--color-text)" }}>{s.name}</div>
                      <div style={{ color: "var(--color-text-subtle)" }}>{s.desc}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <SectionTitle>Project</SectionTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <LinkPill icon={<Github size={11} />} label="github.com/TheHolyOneZ/ZDirMap" onClick={() => link("https://github.com/TheHolyOneZ/ZDirMap")} />
                  <LinkPill icon={<Globe size={11} />} label="zsync.eu/zdirmap" onClick={() => link("https://zsync.eu/zdirmap/")} />
                </div>
              </section>

              <section>
                <SectionTitle>Author</SectionTitle>
                <div className="mt-2 flex flex-col gap-2">
                  <div className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
                    Built with care by{" "}
                    <strong style={{ color: "var(--color-accent-3)" }}>TheHolyOneZ</strong>.
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <LinkPill icon={<Github size={11} />} label="github.com/TheHolyOneZ" onClick={() => link("https://github.com/TheHolyOneZ")} />
                    <LinkPill icon={<Globe size={11} />} label="zsync.eu" onClick={() => link("https://zsync.eu")} />
                  </div>
                </div>
              </section>

              <section>
                <SectionTitle icon={<Scale size={11} />}>License</SectionTitle>
                <div className="mt-2 text-[11.5px] mono" style={{ color: "var(--color-text-subtle)" }}>
                  ZDirMap © 2026 TheHolyOneZ — Released under the{" "}
                  <button onClick={() => link("https://www.gnu.org/licenses/gpl-3.0.html")}
                    style={{ color: "var(--color-accent-3)" }}>
                    GNU General Public License v3.0
                  </button>.
                </div>
              </section>
            </div>
          </motion.div>
          </motion.div>
      )}
    </AnimatePresence>
  );
}

function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color: "var(--color-text-subtle)" }}>
      {icon}
      {children}
    </div>
  );
}

function LinkPill({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-7 px-2.5 rounded-lg text-[11px] mono cursor-default flex items-center gap-1.5"
      style={{
        background: "var(--color-cyan-dim)",
        border: "1px solid var(--color-accent-3)",
        color: "var(--color-accent-3)",
      }}
    >
      {icon}
      {label}
    </button>
  );
}
