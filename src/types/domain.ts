export interface DirNode {
  id: string;
  path: string;
  relPath: string;
  name: string;
  parentId: string | null;
  isDir: boolean;
  depth: number;
  size: number;
  mtime: number | null;
  childrenCount: number;
  isSymlink: boolean;
  lines: number | null;
}

export type OutputFormat = "ascii" | "markdown" | "json" | "yaml" | "flat" | "csv" | "html" | "mermaid" | "treemap";
export type TextOutputFormat = Exclude<OutputFormat, "treemap">;

export interface OutputOptions {
  showSizes: boolean;
  showMtime: boolean;
  showLines: boolean;
  depthCap: number | null;
  filesOnly: boolean;
  foldersOnly: boolean;
  hideDotfiles: boolean;
  ignoreCommon: boolean;
  sort: "name" | "size" | "mtime";
  trailingSlash: boolean;
}

export interface ScanOptions {
  maxDepth: number | null;
  followSymlinks: boolean;
  includeHidden: boolean;
  includeFiles: boolean;
  includeDirs: boolean;
  useGitignore: boolean;
  useDefaults: boolean;
  extraGlobs: string[];
  emitBatchSize: number;
  computeSizes: boolean;
  computeLines: boolean;
}

export interface Preset {
  id: string;
  name: string;
  patterns: string[];
  useDefaults: boolean;
}

export interface SnapshotMeta {
  id: string;
  name: string;
  createdAt: number;
  root: string;
  file: string;
  nodeCount: number;
}

export interface Snapshot {
  version: number;
  id: string;
  name: string;
  createdAt: number;
  root: string;
  outputFormat: OutputFormat;
  outputOptions: OutputOptions;
  selection: {
    checked: string[];
    comments: Record<string, string>;
  };
  nodes: DirNode[];
}

export type ScanStatus = "idle" | "scanning" | "done" | "cancelled" | "error";
