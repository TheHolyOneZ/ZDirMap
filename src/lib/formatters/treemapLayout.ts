import { hierarchy, treemap, treemapSquarify, type HierarchyRectangularNode } from "d3-hierarchy";
import type { DirNode } from "../../types/domain";
import type { FormatCtx } from "./common";

export interface TreemapCell {
  id: string;
  name: string;
  path: string;
  isDir: boolean;
  depth: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  size: number;
  color: string;
}

interface Tree {
  id: string;
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  children?: Tree[];
}

function buildTree(ctx: FormatCtx, rootId: string): Tree | null {
  const node = ctx.nodes.get(rootId);
  if (!node) return null;
  const t: Tree = {
    id: node.id,
    name: node.name,
    path: node.path,
    isDir: node.isDir,
    size: node.isDir ? 0 : Math.max(1, node.size),
  };
  if (node.isDir) {
    const kids = ctx.childIndex.get(rootId) ?? [];
    const children: Tree[] = [];
    for (const k of kids) {
      const c = buildTree(ctx, k);
      if (c) children.push(c);
    }
    if (children.length) t.children = children;
  }
  return t;
}

function colorFor(name: string, depth: number): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  const sat = 55;
  const light = Math.min(72, 38 + depth * 5);
  return `hsl(${hue} ${sat}% ${light}%)`;
}

export function layoutTreemap(
  ctx: FormatCtx,
  width: number,
  height: number,
  startId: string | null = null,
): TreemapCell[] {
  const rootId = startId ?? ctx.rootId;
  const t = buildTree(ctx, rootId);
  if (!t) return [];

  const root = hierarchy<Tree>(t, (d) => d.children).sum((d) =>
    d.children && d.children.length ? 0 : Math.max(1, d.size),
  ).sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  const laid = treemap<Tree>()
    .size([width, height])
    .tile(treemapSquarify)
    .padding(2)
    .paddingTop(14)(root) as HierarchyRectangularNode<Tree>;

  const cells: TreemapCell[] = [];
  laid.each((node) => {
    if (node.depth === 0) return;
    const w = (node.x1 - node.x0) | 0;
    const h = (node.y1 - node.y0) | 0;
    if (w < 2 || h < 2) return;
    cells.push({
      id: node.data.id,
      name: node.data.name,
      path: node.data.path,
      isDir: node.data.isDir,
      depth: node.depth,
      x0: node.x0,
      y0: node.y0,
      x1: node.x1,
      y1: node.y1,
      size: node.value ?? 0,
      color: colorFor(node.data.name, node.depth),
    });
  });
  return cells;
}

export function totalSize(ctx: FormatCtx, rootId: string): number {
  const n = ctx.nodes.get(rootId);
  if (!n) return 0;
  if (!n.isDir) return n.size;
  let sum = 0;
  const stack = [rootId];
  while (stack.length) {
    const cur = stack.pop()!;
    const cn = ctx.nodes.get(cur);
    if (!cn) continue;
    if (!cn.isDir) sum += cn.size;
    const kids = ctx.childIndex.get(cur);
    if (kids) for (const k of kids) stack.push(k);
  }
  return sum;
}

export type DirNodeRef = DirNode;
