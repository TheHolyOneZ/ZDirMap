import type { FormatCtx } from "./common";
import { visibleChildren } from "./common";

export function mermaid(ctx: FormatCtx): string {
  const root = ctx.nodes.get(ctx.rootId);
  if (!root) return "";
  const lines: string[] = ["graph TD"];
  const edges: string[] = [];
  emitNode(ctx, ctx.rootId, lines);
  walk(ctx, ctx.rootId, lines, edges);
  lines.push(...edges);
  lines.push("classDef dir fill:#1e293b,stroke:#22d3ee,color:#fff;");
  lines.push("classDef file fill:#0f172a,stroke:#475569,color:#cbd5e1;");
  return "```mermaid\n" + lines.join("\n") + "\n```";
}

function safeId(id: string): string {
  return "n" + id.replace(/[^a-zA-Z0-9]/g, "");
}

function label(name: string): string {
  return name.replace(/"/g, "&quot;").replace(/\|/g, "&#124;");
}

function emitNode(ctx: FormatCtx, id: string, lines: string[]) {
  const n = ctx.nodes.get(id)!;
  const shape = n.isDir ? `["${label(n.name)}/"]` : `("${label(n.name)}")`;
  lines.push(`${safeId(id)}${shape}:::${n.isDir ? "dir" : "file"}`);
}

function walk(ctx: FormatCtx, parentId: string, lines: string[], edges: string[]) {
  for (const id of visibleChildren(parentId, ctx)) {
    emitNode(ctx, id, lines);
    edges.push(`${safeId(parentId)} --> ${safeId(id)}`);
    const n = ctx.nodes.get(id)!;
    if (n.isDir) walk(ctx, id, lines, edges);
  }
}
