import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type {
  ScanCancelledPayload,
  ScanDonePayload,
  ScanErrorPayload,
  ScanNodesPayload,
  ScanProgressPayload,
  ScanSizesPayload,
  ScanLinesPayload,
} from "../types/ipc";

export const onScanProgress = (cb: (p: ScanProgressPayload) => void): Promise<UnlistenFn> =>
  listen<ScanProgressPayload>("scan://progress", (e) => cb(e.payload));

export const onScanNodes = (cb: (p: ScanNodesPayload) => void): Promise<UnlistenFn> =>
  listen<ScanNodesPayload>("scan://nodes", (e) => cb(e.payload));

export const onScanSizes = (cb: (p: ScanSizesPayload) => void): Promise<UnlistenFn> =>
  listen<ScanSizesPayload>("scan://sizes", (e) => cb(e.payload));

export const onScanLines = (cb: (p: ScanLinesPayload) => void): Promise<UnlistenFn> =>
  listen<ScanLinesPayload>("scan://lines", (e) => cb(e.payload));

export const onScanDone = (cb: (p: ScanDonePayload) => void): Promise<UnlistenFn> =>
  listen<ScanDonePayload>("scan://done", (e) => cb(e.payload));

export const onScanError = (cb: (p: ScanErrorPayload) => void): Promise<UnlistenFn> =>
  listen<ScanErrorPayload>("scan://error", (e) => cb(e.payload));

export const onScanCancelled = (cb: (p: ScanCancelledPayload) => void): Promise<UnlistenFn> =>
  listen<ScanCancelledPayload>("scan://cancelled", (e) => cb(e.payload));
