import type { DirNode } from "../types/domain";

export type CheckState = "checked" | "unchecked" | "partial";

export interface TristateCtx {
  nodes: Map<string, DirNode>;
  childIndex: Map<string, string[]>;
  checked: Set<string>;
  partial: Set<string>;
}

export function stateOf(id: string, checked: Set<string>, partial: Set<string>): CheckState {
  if (checked.has(id)) return "checked";
  if (partial.has(id)) return "partial";
  return "unchecked";
}


export function toggle(ctx: TristateCtx, id: string): { checked: Set<string>; partial: Set<string> } {
  const checked = new Set(ctx.checked);
  const partial = new Set(ctx.partial);
  const target: "checked" | "unchecked" = checked.has(id) ? "unchecked" : "checked";


  const stack: string[] = [id];
  while (stack.length) {
    const cur = stack.pop()!;
    if (target === "checked") {
      checked.add(cur);
      partial.delete(cur);
    } else {
      checked.delete(cur);
      partial.delete(cur);
    }
    const kids = ctx.childIndex.get(cur);
    if (kids) for (const k of kids) stack.push(k);
  }


  let parentId = ctx.nodes.get(id)?.parentId ?? null;
  while (parentId) {
    const kids = ctx.childIndex.get(parentId) ?? [];
    let cCount = 0;
    let pCount = 0;
    for (const k of kids) {
      if (checked.has(k)) cCount++;
      else if (partial.has(k)) pCount++;
    }
    const prevChecked = checked.has(parentId);
    const prevPartial = partial.has(parentId);

    if (cCount === kids.length && kids.length > 0) {
      checked.add(parentId);
      partial.delete(parentId);
    } else if (cCount === 0 && pCount === 0) {
      checked.delete(parentId);
      partial.delete(parentId);
    } else {
      partial.add(parentId);
      checked.delete(parentId);
    }

    const nowChecked = checked.has(parentId);
    const nowPartial = partial.has(parentId);
    if (nowChecked === prevChecked && nowPartial === prevPartial) break;
    parentId = ctx.nodes.get(parentId)?.parentId ?? null;
  }

  return { checked, partial };
}


export function setAll(ctx: TristateCtx, value: boolean): { checked: Set<string>; partial: Set<string> } {
  const checked = new Set<string>();
  const partial = new Set<string>();
  if (value) for (const id of ctx.nodes.keys()) checked.add(id);
  return { checked, partial };
}
