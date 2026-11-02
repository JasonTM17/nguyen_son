type AnswerBlock = { kind: "paragraph"; lines: string[] } | { kind: "list"; ordered: boolean; start: number; items: string[] };

// Small plain-text renderer: preserve model line breaks and list structure without
// accepting HTML, Markdown links, or model-supplied interactive elements.
export function AssistantAnswer({ content }: { readonly content: string }) {
  const blocks: AnswerBlock[] = [];
  let current: AnswerBlock | undefined;
  for (const rawLine of content.replace(/\r\n?/g, "\n").split("\n")) {
    const line = rawLine.trim();
    if (!line) { current = undefined; continue; }
    const numbered = line.match(/^(\d{1,3})[.)]\s+(.+)$/);
    const bullet = line.match(/^[-•]\s+(.+)$/);
    if (numbered || bullet) {
      const ordered = Boolean(numbered);
      const start = numbered ? Number(numbered[1]) : 1;
      if (current?.kind !== "list" || current.ordered !== ordered || ordered && start !== current.start + current.items.length) {
        current = { kind: "list", ordered, start, items: [] };
        blocks.push(current);
      }
      current.items.push(numbered ? numbered[2] : bullet![1]);
    } else if (current?.kind === "list") {
      current.items[current.items.length - 1] += `\n${line}`;
    } else {
      if (!current) { current = { kind: "paragraph", lines: [] }; blocks.push(current); }
      current.lines.push(line);
    }
  }

  return <div className="portfolio-assistant__answer">{blocks.map((block, index) => {
    if (block.kind === "paragraph") return <p key={index}>{block.lines.join("\n")}</p>;
    const items = block.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>);
    return block.ordered ? <ol key={index} start={block.start}>{items}</ol> : <ul key={index}>{items}</ul>;
  })}</div>;
}
