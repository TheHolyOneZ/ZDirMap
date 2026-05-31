import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore, selectFormatCtx } from "../../store";
import { formatters } from "../../lib/formatters";
import type { TextOutputFormat } from "../../types/domain";

interface Props { format: TextOutputFormat }

export default function OutputViewerText({ format }: Props) {
  const ctx = useStore(useShallow(selectFormatCtx));
  const text = useMemo(() => {
    if (!ctx.rootId) return "";
    try {
      return formatters[format](ctx);
    } catch (e: any) {
      return `// formatter error: ${e?.message ?? String(e)}`;
    }
  }, [ctx, format]);

  return (
    <pre
      className="mono text-[12px] leading-[1.55] p-4 whitespace-pre overflow-auto h-full select-text"
      style={{ color: "var(--color-text)" }}
    >
      {text || "// nothing to display — pick a folder and check some entries"}
    </pre>
  );
}
