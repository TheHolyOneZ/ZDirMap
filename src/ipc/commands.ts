import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import type { Preset, ScanOptions, Snapshot, SnapshotMeta } from "../types/domain";

export const pickPath = async (): Promise<string | null> => {
  const r = await open({ directory: true, multiple: false });
  return (typeof r === "string" ? r : null);
};

export const startScan = (root: string, options: ScanOptions) =>
  invoke<string>("start_scan", { root, options });

export const cancelScan = (scanId: string) =>
  invoke<void>("cancel_scan", { scanId });

export const readGitignore = (root: string) =>
  invoke<string[]>("read_gitignore", { root });

export const writeTextFile = (path: string, text: string) =>
  invoke<void>("write_text_file", { path, text });

export const copyToClipboard = (text: string) => writeText(text);

export const listPresets = () => invoke<Preset[]>("list_presets");
export const savePreset = (preset: Preset) => invoke<void>("save_preset", { preset });
export const deletePreset = (id: string) => invoke<void>("delete_preset", { id });

export const listSnapshots = () => invoke<SnapshotMeta[]>("list_snapshots");
export const saveSnapshot = (snapshot: Snapshot) => invoke<string>("save_snapshot", { snapshot });
export const loadSnapshot = (path: string) => invoke<Snapshot>("load_snapshot", { path });
export const deleteSnapshot = (path: string) => invoke<void>("delete_snapshot", { path });

export const saveDialog = async (defaultName: string): Promise<string | null> => {
  const r = await save({ defaultPath: defaultName });
  return r ?? null;
};

export const pickDirectory = async (): Promise<string | null> => {
  const r = await open({ directory: true, multiple: false });
  return typeof r === "string" ? r : null;
};
