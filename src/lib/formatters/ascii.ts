import type { FormatCtx } from "./common";
import { suffix, visibleChildren } from "./common";

export function ascii(ctx: FormatCtx): string {
  const root = ctx.nodes.get(ctx.rootId);
  if (!root) return "";
  const lines: string[] = [];
  const slash = ctx.options.trailingSlash && root.isDir ? "/" : "";
  const rootComment = ctx.comments.get(root.id);
  lines.push(`${root.name}${slash}${suffix(root, ctx.options)}${rootComment ? `  # ${rootComment}` : ""}`);
  walk(ctx, ctx.rootId, "", lines);
  return lines.join("\n");
}

function walk(ctx: FormatCtx, parentId: string, prefix: string, lines: string[]) {
  const kids = visibleChildren(parentId, ctx);
  for (let i = 0; i < kids.length; i++) {
    const id = kids[i];
    const n = ctx.nodes.get(id)!;
    const last = i === kids.length - 1;
    const branch = last ? "└── " : "├── ";
    const slash = ctx.options.trailingSlash && n.isDir ? "/" : "";
    const comment = ctx.comments.get(id);
    lines.push(
      `${prefix}${branch}${n.name}${slash}${suffix(n, ctx.options)}${comment ? `  # ${comment}` : ""}`,
    );
    if (n.isDir) walk(ctx, id, prefix + (last ? "    " : "│   "), lines);
  }
}
