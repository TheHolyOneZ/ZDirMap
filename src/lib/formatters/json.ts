import type { FormatCtx } from "./common";
import { visibleChildren } from "./common";

interface JsonNode {
  name: string;
  isDir: boolean;
  size?: number;
  mtime?: number;
  lines?: number;
  comment?: string;
  children?: JsonNode[];
}

export function json(ctx: FormatCtx): string {
  const root = ctx.nodes.get(ctx.rootId);
  if (!root) return "{}";
  return JSON.stringify(build(ctx, ctx.rootId), null, 2);
}

function build(ctx: FormatCtx, id: string): JsonNode {
  const n = ctx.nodes.get(id)!;
  const node: JsonNode = { name: n.name, isDir: n.isDir };
  if (ctx.options.showSizes) node.size = n.size;
  if (ctx.options.showMtime && n.mtime != null) node.mtime = n.mtime;
  if (ctx.options.showLines && n.lines != null) node.lines = n.lines;
  const cmt = ctx.comments.get(id);
  if (cmt) node.comment = cmt;
  if (n.isDir) {
    const kids = visibleChildren(id, ctx).map((cid) => build(ctx, cid));
    if (kids.length) node.children = kids;
  }
  return node;
}
