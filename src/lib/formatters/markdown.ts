import type { FormatCtx } from "./common";
import { suffix, visibleChildren } from "./common";

export function markdown(ctx: FormatCtx): string {
  const root = ctx.nodes.get(ctx.rootId);
  if (!root) return "";
  const lines: string[] = [];
  const slash = root.isDir && ctx.options.trailingSlash ? "/" : "";
  const cmt = ctx.comments.get(root.id);
  lines.push(`- ${root.name}${slash}${suffix(root, ctx.options)}${cmt ? `  *${cmt}*` : ""}`);
  walk(ctx, ctx.rootId, 1, lines);
  return lines.join("\n");
}

function walk(ctx: FormatCtx, parentId: string, depth: number, lines: string[]) {
  for (const id of visibleChildren(parentId, ctx)) {
    const n = ctx.nodes.get(id)!;
    const slash = n.isDir && ctx.options.trailingSlash ? "/" : "";
    const cmt = ctx.comments.get(id);
    lines.push(
      `${"  ".repeat(depth)}- ${n.name}${slash}${suffix(n, ctx.options)}${cmt ? `  *${cmt}*` : ""}`,
    );
    if (n.isDir) walk(ctx, id, depth + 1, lines);
  }
}
