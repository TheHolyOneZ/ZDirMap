import type { FormatCtx } from "./common";
import { suffix, visibleChildren } from "./common";

export function flat(ctx: FormatCtx): string {
  const root = ctx.nodes.get(ctx.rootId);
  if (!root) return "";
  const lines: string[] = [];
  walk(ctx, ctx.rootId, root.name + (root.isDir ? "/" : ""), lines);
  return lines.join("\n");
}

function walk(ctx: FormatCtx, parentId: string, prefix: string, lines: string[]) {
  const pNode = ctx.nodes.get(parentId)!;
  if (ctx.checked.has(parentId) || parentId === ctx.rootId) {
    lines.push(prefix + suffix(pNode, ctx.options));
  }
  for (const id of visibleChildren(parentId, ctx)) {
    const n = ctx.nodes.get(id)!;
    const next = prefix + n.name + (n.isDir ? "/" : "");
    if (n.isDir) {
      walk(ctx, id, next, lines);
    } else if (ctx.checked.has(id)) {
      lines.push(next + suffix(n, ctx.options));
    }
  }
}
