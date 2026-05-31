import type { DirNode } from "./domain";

export interface IpcError {
  code: string;
  message: string;
}

export interface ScanProgressPayload {
  scanId: string;
  scannedCount: number;
  currentPath: string;
  elapsedMs: number;
}

export interface ScanNodesPayload {
  scanId: string;
  nodes: DirNode[];
}

export interface ScanSizesPayload {
  scanId: string;
  sizes: Array<[string, number]>;
}

export interface ScanLinesPayload {
  scanId: string;
  lines: Array<[string, number]>;
}

export interface ScanDonePayload {
  scanId: string;
  totalNodes: number;
  totalBytes: number;
  durationMs: number;
  warnings: string[];
}

export interface ScanErrorPayload {
  scanId: string;
  message: string;
}

export interface ScanCancelledPayload {
  scanId: string;
}
