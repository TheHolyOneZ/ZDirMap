import type { DirNode, Snapshot } from "../types/domain";

export interface DiffEntry {
  kind: "added" | "removed" | "changed";
  path: string;
  isDir: boolean;
  before?: DirNode;
  after?: DirNode;
}

export function diffSnapshots(a: Snapshot, b: Snapshot): DiffEntry[] {
  const am = new Map(a.nodes.map((n) => [n.relPath, n]));
  const bm = new Map(b.nodes.map((n) => [n.relPath, n]));
  const out: DiffEntry[] = [];
  for (const [rel, node] of bm) {
    const prior = am.get(rel);
    if (!prior) out.push({ kind: "added", path: rel, isDir: node.isDir, after: node });
    else if (prior.size !== node.size || prior.mtime !== node.mtime)
      out.push({ kind: "changed", path: rel, isDir: node.isDir, before: prior, after: node });
  }
  for (const [rel, node] of am) {
    if (!bm.has(rel)) out.push({ kind: "removed", path: rel, isDir: node.isDir, before: node });
  }
  out.sort((x, y) => x.path.localeCompare(y.path));
  return out;
}
