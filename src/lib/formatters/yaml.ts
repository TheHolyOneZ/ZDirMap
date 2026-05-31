import type { FormatCtx } from "./common";
import { visibleChildren } from "./common";

export function yaml(ctx: FormatCtx): string {
  const root = ctx.nodes.get(ctx.rootId);
  if (!root) return "";
  const lines: string[] = [];
  walk(ctx, ctx.rootId, 0, lines);
  return lines.join("\n");
}

function esc(s: string): string {
  if (/^[A-Za-z0-9_.\-/]+$/.test(s)) return s;
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function walk(ctx: FormatCtx, id: string, depth: number, lines: string[]) {
  const n = ctx.nodes.get(id)!;
  const pad = "  ".repeat(depth);
  lines.push(`${pad}- name: ${esc(n.name)}`);
  const inner = pad + "  ";
  lines.push(`${inner}type: ${n.isDir ? "dir" : "file"}`);
  if (ctx.options.showSizes) lines.push(`${inner}size: ${n.size}`);
  if (ctx.options.showMtime && n.mtime != null) lines.push(`${inner}mtime: ${n.mtime}`);
  if (ctx.options.showLines && n.lines != null) lines.push(`${inner}lines: ${n.lines}`);
  const cmt = ctx.comments.get(id);
  if (cmt) lines.push(`${inner}comment: ${esc(cmt)}`);
  if (n.isDir) {
    const kids = visibleChildren(id, ctx);
    if (kids.length) {
      lines.push(`${inner}children:`);
      for (const cid of kids) walk(ctx, cid, depth + 2, lines);
    }
  }
}
