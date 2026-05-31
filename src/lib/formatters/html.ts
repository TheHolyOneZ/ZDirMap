import type { FormatCtx } from "./common";
import { suffix, visibleChildren } from "./common";

export function html(ctx: FormatCtx): string {
  const root = ctx.nodes.get(ctx.rootId);
  if (!root) return "";
  const body = renderNode(ctx, ctx.rootId, true);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escape(root.name)} — ZDirMap</title>
<style>
  :root { color-scheme: dark; }
  body { background: #06060d; color: rgba(255,255,255,0.92); font: 13px/1.55 ui-monospace, "JetBrains Mono", monospace; margin: 0; padding: 24px; }
  h1 { font: 600 14px/1.2 system-ui, sans-serif; letter-spacing: 0.12em; text-transform: uppercase; color: #22d3ee; margin: 0 0 18px; }
  details { padding-left: 14px; border-left: 1px solid rgba(255,255,255,0.06); }
  details > summary { list-style: none; cursor: pointer; padding: 1px 0; }
  details > summary::-webkit-details-marker { display: none; }
  details > summary::before { content: "▸ "; color: rgba(255,255,255,0.4); display: inline-block; width: 12px; transition: transform 120ms ease; }
  details[open] > summary::before { content: "▾ "; }
  .file { padding: 1px 0 1px 12px; color: rgba(255,255,255,0.7); }
  .dir > summary { color: #22d3ee; }
  .meta { color: rgba(255,255,255,0.35); font-size: 11px; margin-left: 6px; }
  .cmt { color: #22d3ee; font-size: 11px; margin-left: 8px; }
</style>
</head>
<body>
<h1>${escape(root.name)}</h1>
${body}
</body>
</html>`;
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function meta(s: string): string {
  return s ? ` <span class="meta">${escape(s)}</span>` : "";
}

function renderNode(ctx: FormatCtx, id: string, open: boolean): string {
  const n = ctx.nodes.get(id)!;
  const cmt = ctx.comments.get(id);
  const cmtHtml = cmt ? ` <span class="cmt"># ${escape(cmt)}</span>` : "";
  const metaStr = suffix(n, ctx.options).trim();
  if (!n.isDir) {
    return `<div class="file">${escape(n.name)}${cmtHtml}${meta(metaStr)}</div>`;
  }
  const kids = visibleChildren(id, ctx).map((cid) => renderNode(ctx, cid, false)).join("\n");
  return `<details class="dir"${open ? " open" : ""}><summary>${escape(n.name)}/${cmtHtml}${meta(metaStr)}</summary>
${kids}
</details>`;
}
