import type { DirNode, OutputOptions } from "../../types/domain";
import { humanSize, relativeTime } from "../filesize";
import { sortChildren } from "../treeOps";

export interface FormatCtx {
  nodes: Map<string, DirNode>;
  childIndex: Map<string, string[]>;
  customOrder: Map<string, string[]>;
  checked: Set<string>;
  comments: Map<string, string>;
  rootId: string;
  options: OutputOptions;
}

export function suffix(node: DirNode, opts: OutputOptions): string {
  const parts: string[] = [];
  if (opts.showSizes) parts.push(humanSize(node.size));
  if (opts.showMtime && node.mtime != null) parts.push(relativeTime(node.mtime));
  if (opts.showLines && node.lines != null) parts.push(`${node.lines.toLocaleString()} lines`);
  return parts.length ? ` (${parts.join(", ")})` : "";
}

export function visibleChildren(
  parentId: string,
  ctx: FormatCtx,
): string[] {
  const custom = ctx.customOrder.get(parentId);
  const baseIds = custom ?? ctx.childIndex.get(parentId) ?? [];
  const sorted = custom ? baseIds : sortChildren(baseIds, ctx.nodes, ctx.options.sort);
  const out: string[] = [];
  for (const id of sorted) {
    const n = ctx.nodes.get(id);
    if (!n) continue;
    if (!ctx.checked.has(id) && !hasCheckedDescendant(id, ctx)) continue;
    if (ctx.options.filesOnly && n.isDir) {

      if (hasCheckedDescendant(id, ctx)) out.push(id);
      continue;
    }
    if (ctx.options.foldersOnly && !n.isDir) continue;
    if (ctx.options.hideDotfiles && n.name.startsWith(".")) continue;
    if (ctx.options.depthCap != null && n.depth > ctx.options.depthCap) continue;
    out.push(id);
  }
  return out;
}

function hasCheckedDescendant(id: string, ctx: FormatCtx): boolean {
  if (ctx.checked.has(id)) return true;
  const kids = ctx.childIndex.get(id);
  if (!kids) return false;
  for (const k of kids) if (hasCheckedDescendant(k, ctx)) return true;
  return false;
}
