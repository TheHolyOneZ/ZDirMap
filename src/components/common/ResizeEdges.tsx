import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

type Dir =
  | "North" | "South" | "East" | "West"
  | "NorthEast" | "NorthWest" | "SouthEast" | "SouthWest";

const DIRS: Array<{ d: Dir; style: React.CSSProperties; cursor: string }> = [
  { d: "North",     style: { top: 0, left: 6, right: 6, height: 4 }, cursor: "ns-resize" },
  { d: "South",     style: { bottom: 0, left: 6, right: 6, height: 4 }, cursor: "ns-resize" },
  { d: "West",      style: { top: 6, bottom: 6, left: 0, width: 4 }, cursor: "ew-resize" },
  { d: "East",      style: { top: 6, bottom: 6, right: 0, width: 4 }, cursor: "ew-resize" },
  { d: "NorthWest", style: { top: 0, left: 0, width: 8, height: 8 }, cursor: "nwse-resize" },
  { d: "NorthEast", style: { top: 0, right: 0, width: 8, height: 8 }, cursor: "nesw-resize" },
  { d: "SouthWest", style: { bottom: 0, left: 0, width: 8, height: 8 }, cursor: "nesw-resize" },
  { d: "SouthEast", style: { bottom: 0, right: 0, width: 8, height: 8 }, cursor: "nwse-resize" },
];

export default function ResizeEdges() {
  const onStart = async (d: Dir, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      const win = getCurrentWebviewWindow();
      await (win as any).startResizeDragging(d);
    } catch {}
  };
  return (
    <>
      {DIRS.map(({ d, style, cursor }) => (
        <div
          key={d}
          onMouseDown={(e) => onStart(d, e)}
          style={{ position: "fixed", zIndex: 100, cursor, ...style }}
        />
      ))}
    </>
  );
}
