import type { DirNode } from "../types/domain";

export function buildChildIndex(nodes: Map<string, DirNode>): Map<string, string[]> {
  const idx = new Map<string, string[]>();
  for (const n of nodes.values()) {
    if (n.parentId) {
      let arr = idx.get(n.parentId);
      if (!arr) {
        arr = [];
        idx.set(n.parentId, arr);
      }
      arr.push(n.id);
    }
  }

  for (const [k, arr] of idx) {
    arr.sort((a, b) => {
      const na = nodes.get(a)!;
      const nb = nodes.get(b)!;
      if (na.isDir !== nb.isDir) return na.isDir ? -1 : 1;
      return na.name.localeCompare(nb.name);
    });
    idx.set(k, arr);
  }
  return idx;
}

export function findRootId(nodes: Map<string, DirNode>): string | null {
  for (const n of nodes.values()) if (n.parentId === null) return n.id;
  return null;
}

export function sortChildren(
  ids: string[],
  nodes: Map<string, DirNode>,
  by: "name" | "size" | "mtime",
): string[] {
  const arr = [...ids];
  arr.sort((a, b) => {
    const na = nodes.get(a)!;
    const nb = nodes.get(b)!;
    if (na.isDir !== nb.isDir) return na.isDir ? -1 : 1;
    if (by === "size") return nb.size - na.size;
    if (by === "mtime") return (nb.mtime ?? 0) - (na.mtime ?? 0);
    return na.name.localeCompare(nb.name);
  });
  return arr;
}
