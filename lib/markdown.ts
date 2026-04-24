import { remark } from "remark";
import html from "remark-html";

export async function renderMarkdown(content: string) {
  const processed = await remark().use(html).process(content);
  return processed.toString();
}
