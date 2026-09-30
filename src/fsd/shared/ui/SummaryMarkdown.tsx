import { parseSummaryMarkdown, splitSummaryEmphasis, type SummaryItem } from "@fsd/shared/lib";

export function SummaryMarkdown({ text, className = "" }: { text: string; className?: string }) {
  return <div className={`min-w-0 wrap-anywhere break-keep ${className}`}>
    {parseSummaryMarkdown(text).map((block, index) => block.type === "list"
      ? <SummaryList key={index} items={block.items} />
      : <p key={index} className="min-h-[1lh] whitespace-pre-wrap"><Emphasis text={block.text} /></p>)}
  </div>;
}

function SummaryList({ items }: { items: SummaryItem[] }) {
  return <ul className="list-disc pl-5">
    {items.map((item, index) => <li key={index}><Emphasis text={item.text} />{item.children.length > 0 && <SummaryList items={item.children} />}</li>)}
  </ul>;
}

function Emphasis({ text }: { text: string }) {
  return splitSummaryEmphasis(text).map((part, index) => /^\*\*.+\*\*$/.test(part)
    ? <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>
    : part);
}
