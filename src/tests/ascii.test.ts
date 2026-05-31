import { describe, it, expect } from "vitest";
import type { DirNode, OutputOptions } from "../types/domain";
import { buildChildIndex } from "../lib/treeOps";
import { ascii } from "../lib/formatters/ascii";
import { markdown } from "../lib/formatters/markdown";
import { json } from "../lib/formatters/json";
import { flat } from "../lib/formatters/flat";
import { toggle } from "../lib/tristate";

const mk = (id: string, name: string, parentId: string | null, isDir: boolean, depth: number, size = 0): DirNode => ({
  id, name, parentId, isDir, depth, size,
  path: `/${id}`, relPath: id, mtime: null, childrenCount: 0, isSymlink: false, lines: null,
});

const defaultOpts: OutputOptions = {
  showSizes: false, showMtime: false, showLines: false, depthCap: null,
  filesOnly: false, foldersOnly: false, hideDotfiles: false,
  ignoreCommon: false, sort: "name", trailingSlash: true,
};

function buildCtx() {
  const nodes = new Map<string, DirNode>([
    ["r", mk("r", "root", null, true, 0)],
    ["a", mk("a", "src", "r", true, 1)],
    ["b", mk("b", "App.tsx", "a", false, 2, 1024)],
    ["c", mk("c", "main.ts", "a", false, 2, 256)],
    ["d", mk("d", "readme.md", "r", false, 1, 64)],
  ]);
  const childIndex = buildChildIndex(nodes);
  const checked = new Set(["r", "a", "b", "c", "d"]);
  return {
    nodes, childIndex, customOrder: new Map(),
    checked, comments: new Map(), rootId: "r", options: defaultOpts,
  };
}

describe("ascii formatter", () => {
  it("renders an ascii tree with branches", () => {
    const out = ascii(buildCtx());
    expect(out).toMatchInlineSnapshot(`
      "root/
      ├── src/
      │   ├── App.tsx
      │   └── main.ts
      └── readme.md"
    `);
  });
});

describe("markdown formatter", () => {
  it("renders nested bullets", () => {
    expect(markdown(buildCtx())).toMatchInlineSnapshot(`
      "- root/
        - src/
          - App.tsx
          - main.ts
        - readme.md"
    `);
  });
});

describe("json formatter", () => {
  it("renders a nested object", () => {
    const out = JSON.parse(json(buildCtx()));
    expect(out.name).toBe("root");
    expect(out.children[0].name).toBe("src");
    expect(out.children[0].children).toHaveLength(2);
  });
});

describe("flat formatter", () => {
  it("emits POSIX paths for selected files", () => {
    expect(flat(buildCtx())).toMatchInlineSnapshot(`
      "root/
      root/src/
      root/src/App.tsx
      root/src/main.ts
      root/readme.md"
    `);
  });
});

describe("tristate", () => {
  it("toggling a leaf updates ancestor to partial", () => {
    const ctx = buildCtx();
    const fresh = {
      nodes: ctx.nodes, childIndex: ctx.childIndex,
      checked: new Set<string>(), partial: new Set<string>(),
    };
    const after = toggle(fresh, "b");
    expect(after.checked.has("b")).toBe(true);
    expect(after.partial.has("a")).toBe(true);
    expect(after.partial.has("r")).toBe(true);
  });
});
