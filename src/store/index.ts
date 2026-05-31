import { create } from "zustand";
import type {
  DirNode,
  OutputFormat,
  OutputOptions,
  Preset,
  ScanOptions,
  ScanStatus,
  Snapshot,
  SnapshotMeta,
} from "../types/domain";
import { buildChildIndex, findRootId } from "../lib/treeOps";
import { setAll, toggle } from "../lib/tristate";

export type Toast = {
  id: string;
  type: "info" | "success" | "error" | "warning";
  message: string;
};

export type Panel = "tree" | "snapshots" | "presets" | "about";

interface State {

  theme: "dark" | "light" | "system";
  setTheme: (t: "dark" | "light" | "system") => void;


  panel: Panel;
  setPanel: (p: Panel) => void;


  scanId: string | null;
  status: ScanStatus;
  root: string | null;
  progress: { count: number; currentPath: string; elapsedMs: number };
  scanError: string | null;
  totals: { nodes: number; bytes: number; durationMs: number };
  warnings: string[];
  scanOptions: ScanOptions;
  setScanOption: <K extends keyof ScanOptions>(k: K, v: ScanOptions[K]) => void;
  _scanStarted: (id: string, root: string) => void;
  _scanProgress: (p: { count: number; currentPath: string; elapsedMs: number }) => void;
  _scanDone: (totals: { nodes: number; bytes: number; durationMs: number; warnings: string[] }) => void;
  _scanError: (msg: string) => void;
  _scanCancelled: () => void;


  nodes: Map<string, DirNode>;
  childIndex: Map<string, string[]>;
  rootId: string | null;
  expanded: Set<string>;
  toggleExpanded: (id: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  resetTree: () => void;
  upsertNodes: (ns: DirNode[]) => void;
  applySizes: (sizes: Array<[string, number]>) => void;
  applyLines: (lines: Array<[string, number]>) => void;


  checked: Set<string>;
  partial: Set<string>;
  comments: Map<string, string>;
  customOrder: Map<string, string[]>;
  toggleCheck: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  setComment: (id: string, text: string) => void;
  reorder: (parentId: string, fromIdx: number, toIdx: number) => void;


  format: OutputFormat;
  setFormat: (f: OutputFormat) => void;
  options: OutputOptions;
  setOption: <K extends keyof OutputOptions>(k: K, v: OutputOptions[K]) => void;


  presets: Preset[];
  setPresets: (p: Preset[]) => void;


  snapshots: SnapshotMeta[];
  setSnapshots: (s: SnapshotMeta[]) => void;
  diffAgainst: Snapshot | null;
  setDiffAgainst: (s: Snapshot | null) => void;


  toasts: Toast[];
  addToast: (t: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const defaultScanOptions: ScanOptions = {
  maxDepth: null,
  followSymlinks: false,
  includeHidden: false,
  includeFiles: true,
  includeDirs: true,
  useGitignore: false,
  useDefaults: true,
  extraGlobs: [],
  emitBatchSize: 256,
  computeSizes: true,
  computeLines: false,
};

const defaultOutputOptions: OutputOptions = {
  showSizes: false,
  showMtime: false,
  showLines: false,
  depthCap: null,
  filesOnly: false,
  foldersOnly: false,
  hideDotfiles: false,
  ignoreCommon: true,
  sort: "name",
  trailingSlash: true,
};

let toastSeq = 0;

export const useStore = create<State>((set, get) => ({
  theme: "system",
  setTheme: (theme) => set({ theme }),

  panel: "tree",
  setPanel: (panel) => set({ panel }),

  scanId: null,
  status: "idle",
  root: null,
  progress: { count: 0, currentPath: "", elapsedMs: 0 },
  scanError: null,
  totals: { nodes: 0, bytes: 0, durationMs: 0 },
  warnings: [],
  scanOptions: defaultScanOptions,
  setScanOption: (k, v) => set({ scanOptions: { ...get().scanOptions, [k]: v } }),
  _scanStarted: (scanId, root) =>
    set({
      scanId,
      root,
      status: "scanning",
      progress: { count: 0, currentPath: "", elapsedMs: 0 },
      scanError: null,
      totals: { nodes: 0, bytes: 0, durationMs: 0 },
      warnings: [],
      nodes: new Map(),
      childIndex: new Map(),
      rootId: null,
      checked: new Set(),
      partial: new Set(),
      comments: new Map(),
      customOrder: new Map(),
      expanded: new Set(),
    }),
  _scanProgress: (progress) => set({ progress }),
  _scanDone: ({ nodes, bytes, durationMs, warnings }) =>
    set({ status: "done", totals: { nodes, bytes, durationMs }, warnings }),
  _scanError: (scanError) => set({ status: "error", scanError }),
  _scanCancelled: () => set({ status: "cancelled" }),

  nodes: new Map(),
  childIndex: new Map(),
  rootId: null,
  expanded: new Set(),
  toggleExpanded: (id) => {
    const exp = new Set(get().expanded);
    if (exp.has(id)) exp.delete(id);
    else exp.add(id);
    set({ expanded: exp });
  },
  expandAll: () => set({ expanded: new Set([...get().nodes.keys()].filter((id) => get().nodes.get(id)?.isDir)) }),
  collapseAll: () => set({ expanded: new Set() }),
  resetTree: () =>
    set({
      nodes: new Map(),
      childIndex: new Map(),
      rootId: null,
      expanded: new Set(),
      checked: new Set(),
      partial: new Set(),
      comments: new Map(),
      customOrder: new Map(),
    }),
  upsertNodes: (ns) => {
    const nodes = new Map(get().nodes);
    for (const n of ns) nodes.set(n.id, n);
    const childIndex = buildChildIndex(nodes);
    const rootId = get().rootId ?? findRootId(nodes);

    const expanded = new Set(get().expanded);
    if (rootId && !expanded.has(rootId)) expanded.add(rootId);
    set({ nodes, childIndex, rootId, expanded });
  },
  applySizes: (sizes) => {
    const nodes = new Map(get().nodes);
    for (const [id, size] of sizes) {
      const n = nodes.get(id);
      if (n) nodes.set(id, { ...n, size });
    }
    set({ nodes });
  },
  applyLines: (lines) => {
    const nodes = new Map(get().nodes);
    for (const [id, l] of lines) {
      const n = nodes.get(id);
      if (n) nodes.set(id, { ...n, lines: l });
    }
    set({ nodes });
  },

  checked: new Set(),
  partial: new Set(),
  comments: new Map(),
  customOrder: new Map(),
  toggleCheck: (id) => {
    const s = get();
    const { checked, partial } = toggle(
      { nodes: s.nodes, childIndex: s.childIndex, checked: s.checked, partial: s.partial },
      id,
    );
    set({ checked, partial });
  },
  selectAll: () => {
    const s = get();
    const { checked, partial } = setAll(
      { nodes: s.nodes, childIndex: s.childIndex, checked: s.checked, partial: s.partial },
      true,
    );
    set({ checked, partial });
  },
  deselectAll: () => set({ checked: new Set(), partial: new Set() }),
  setComment: (id, text) => {
    const c = new Map(get().comments);
    if (text.trim()) c.set(id, text);
    else c.delete(id);
    set({ comments: c });
  },
  reorder: (parentId, fromIdx, toIdx) => {
    const s = get();
    const base = s.customOrder.get(parentId) ?? s.childIndex.get(parentId) ?? [];
    const next = [...base];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    const co = new Map(s.customOrder);
    co.set(parentId, next);
    set({ customOrder: co });
  },

  format: "ascii",
  setFormat: (format) => set({ format }),
  options: defaultOutputOptions,
  setOption: (k, v) => set({ options: { ...get().options, [k]: v } }),

  presets: [],
  setPresets: (presets) => set({ presets }),

  snapshots: [],
  setSnapshots: (snapshots) => set({ snapshots }),
  diffAgainst: null,
  setDiffAgainst: (diffAgainst) => set({ diffAgainst }),

  toasts: [],
  addToast: (t) => {
    const id = `t${++toastSeq}`;
    set({ toasts: [...get().toasts, { ...t, id }] });
    setTimeout(() => {
      set({ toasts: get().toasts.filter((x) => x.id !== id) });
    }, 4200);
  },
  removeToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export const selectFormatCtx = (s: State) => ({
  nodes: s.nodes,
  childIndex: s.childIndex,
  customOrder: s.customOrder,
  checked: s.checked,
  comments: s.comments,
  rootId: s.rootId ?? "",
  options: s.options,
});
