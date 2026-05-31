import type { TextOutputFormat } from "../../types/domain";
import { ascii } from "./ascii";
import { markdown } from "./markdown";
import { json } from "./json";
import { yaml } from "./yaml";
import { flat } from "./flat";
import { csv } from "./csv";
import { html } from "./html";
import { mermaid } from "./mermaid";
import type { FormatCtx } from "./common";

export type Formatter = (ctx: FormatCtx) => string;

export const formatters: Record<TextOutputFormat, Formatter> = {
  ascii,
  markdown,
  json,
  yaml,
  flat,
  csv,
  html,
  mermaid,
};

export const formatExtensions: Record<TextOutputFormat, string> = {
  ascii: "txt",
  markdown: "md",
  json: "json",
  yaml: "yaml",
  flat: "txt",
  csv: "csv",
  html: "html",
  mermaid: "md",
};

export type { FormatCtx } from "./common";
