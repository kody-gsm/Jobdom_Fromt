export type SummaryItem = { text: string; children: SummaryItem[] };
export type SummaryBlock = { type: "text"; text: string } | { type: "list"; items: SummaryItem[] };

export function parseSummaryMarkdown(text: string): SummaryBlock[] {
  const blocks: SummaryBlock[] = [];
  let levels: SummaryItem[][] = [];
  for (const line of text.replace(/\r\n?/g, "\n").split("\n")) {
    const match = /^(\s*)- (.*)$/.exec(line);
    if (!match) {
      blocks.push({ type: "text", text: line });
      levels = [];
      continue;
    }
    if (!levels.length) {
      const items: SummaryItem[] = [];
      blocks.push({ type: "list", items });
      levels = [items];
    }
    const depth = Math.min(Math.floor(match[1].replace(/\t/g, "  ").length / 2), levels.length);
    if (depth === levels.length) {
      const parent = levels[depth - 1].at(-1);
      if (parent) levels.push(parent.children);
    }
    levels = levels.slice(0, depth + 1);
    levels.at(-1)!.push({ text: match[2], children: [] });
  }
  return blocks;
}

export const splitSummaryEmphasis = (text: string) => text.split(/(\*\*.+?\*\*)/g);

export function indentSummaryList(text: string, start: number, end: number, outdent = false) {
  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  const lineEnd = text.indexOf("\n", lineStart);
  const line = text.slice(lineStart, lineEnd < 0 ? text.length : lineEnd);
  if (!/^[ \t]*- /.test(line)) return null;
  const removed = outdent ? /^(?:  |\t)/.exec(line)?.[0].length ?? 0 : 0;
  if (outdent && !removed) return null;
  const prefix = outdent ? "" : "  ";
  const delta = prefix.length - removed;
  return {
    text: text.slice(0, lineStart) + prefix + text.slice(lineStart + removed),
    start: Math.max(lineStart, start + delta),
    end: Math.max(lineStart, end + delta),
  };
}
