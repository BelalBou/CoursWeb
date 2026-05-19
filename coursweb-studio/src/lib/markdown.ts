import DOMPurify from "dompurify";
import hljs from "highlight.js";
import { Marked } from "marked";
import "highlight.js/styles/github.css";

const marked = new Marked({
  gfm: true,
  breaks: false,
  async: false
});

marked.use({
  renderer: {
    code(token) {
      const rawCode = token.text ?? "";
      const language = token.lang?.trim().split(/\s+/)[0] ?? "";
      const canHighlight = language && hljs.getLanguage(language);
      const highlighted = canHighlight
        ? hljs.highlight(rawCode, { language }).value
        : hljs.highlightAuto(rawCode).value;
      const languageLabel = language || "text";

      return `<pre class="code-block"><div class="code-title">${languageLabel}</div><code class="hljs language-${languageLabel}">${highlighted}</code></pre>`;
    }
  }
});

export function renderMarkdown(markdown: string) {
  const html = marked.parse(markdown) as string;

  return DOMPurify.sanitize(html, {
    FORBID_TAGS: ["script", "style"]
  });
}
