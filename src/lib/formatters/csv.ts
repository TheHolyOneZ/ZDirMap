import type { FormatCtx } from "./common";
import { visibleChildren } from "./common";

export function csv(ctx: FormatCtx): string {
  const root = ctx.nodes.get(ctx.rootId);
  if (!root) return "";
  const cols = ["path", "type", "depth"];
  if (ctx.options.showSizes) cols.push("size");
  if (ctx.options.showMtime) cols.push("mtime");
  if (ctx.options.showLines) cols.push("lines");
  cols.push("comment");
  const lines: string[] = [cols.join(",")];
  walk(ctx, ctx.rootId, root.name + (root.isDir ? "/" : ""), lines);
  return lines.join("\n");
}

function q(v: string | number | undefined): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function row(ctx: FormatCtx, id: string, path: string): string {
  const n = ctx.nodes.get(id)!;
  const parts: Array<string | number | undefined> = [path, n.isDir ? "dir" : "file", n.depth];
  if (ctx.options.showSizes) parts.push(n.size);
  if (ctx.options.showMtime) parts.push(n.mtime ?? "");
  if (ctx.options.showLines) parts.push(n.lines ?? "");
  parts.push(ctx.comments.get(id) ?? "");
  return parts.map(q).join(",");
}

function walk(ctx: FormatCtx, parentId: string, prefix: string, lines: string[]) {
  if (ctx.checked.has(parentId) || parentId === ctx.rootId) {
    lines.push(row(ctx, parentId, prefix));
  }
  for (const id of visibleChildren(parentId, ctx)) {
    const n = ctx.nodes.get(id)!;
    const next = prefix + n.name + (n.isDir ? "/" : "");
    if (n.isDir) walk(ctx, id, next, lines);
    else if (ctx.checked.has(id)) lines.push(row(ctx, id, next));
  }
}
