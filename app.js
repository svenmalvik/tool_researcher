let content = null;
let themeToggle = null;
let currentMarkdownPath = null;
let mermaidModulePromise = null;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}

function init() {
  content = document.querySelector("#content");
  themeToggle = document.querySelector("#theme-toggle");

  const preferredTheme = getStoredTheme() ?? getSystemTheme();
  applyTheme(preferredTheme);
  themeToggle?.addEventListener("click", toggleTheme);
  window.addEventListener("hashchange", loadMarkdown);
  loadMarkdown();
}

async function loadMarkdown() {
  if (!content) {
    return;
  }

  if (window.location.protocol === "file:") {
    await renderContent(getFallbackMarkdown(), {
      kind: "info",
      message:
        "Opened from disk. Browsers block reading sibling Markdown files over file://, so this page is showing the built-in starter content.",
    });
    return;
  }

  const requestedPath = getRequestedMarkdownPath();

  try {
    const result = requestedPath
      ? await fetchMarkdown(requestedPath)
      : await fetchPreferredMarkdown(["research/index.md", "index.md"]);

    currentMarkdownPath = result.path;
    document.title = getDocumentTitle(result.path);
    await renderContent(result.markdown);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (requestedPath) {
      content.innerHTML = `
        <div class="error-state">
          <h2>Could not render ${escapeHtml(requestedPath)}</h2>
          <p>${escapeHtml(message)}</p>
        </div>
      `;
      return;
    }

    if (getFallbackMarkdown()) {
      currentMarkdownPath = "index.md";
      document.title = getDocumentTitle(currentMarkdownPath);
      await renderContent(getFallbackMarkdown(), {
        kind: "warning",
        message: `Could not load index.md directly. Showing the built-in starter content instead. (${message})`,
      });
      return;
    }

    content.innerHTML = `
      <div class="error-state">
        <h2>Could not render index.md</h2>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  }
}

function getRequestedMarkdownPath() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const requestedPath = params.get("doc");

  if (!requestedPath) {
    return null;
  }

  return resolveMarkdownPath("index.md", requestedPath);
}

async function fetchMarkdown(path) {
  const response = await fetch(path, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to load ${path} (${response.status})`);
  }

  return {
    markdown: await response.text(),
    path,
  };
}

async function fetchPreferredMarkdown(paths) {
  let lastError = null;

  for (const path of paths) {
    try {
      return await fetchMarkdown(path);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Failed to load markdown content");
}

async function renderContent(markdown, notice = null) {
  if (!content) {
    return;
  }

  const noticeMarkup = notice
    ? `
      <div class="content-notice content-notice--${notice.kind}">
        <p>${escapeHtml(notice.message)}</p>
      </div>
    `
    : "";

  content.innerHTML = `${noticeMarkup}${renderMarkdown(markdown)}`;

  try {
    await renderMermaidDiagrams(content);
  } catch (error) {
    console.error("Failed to render Mermaid diagrams.", error);
  }
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  let listItems = [];
  let orderedListItems = [];
  let codeFence = null;

  function flushParagraph() {
    if (paragraph.length === 0) {
      return;
    }

    blocks.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  }

  function flushList() {
    if (listItems.length === 0) {
      return;
    }

    const items = listItems
      .map((item) => `<li>${renderInline(item)}</li>`)
      .join("");
    blocks.push(`<ul>${items}</ul>`);
    listItems = [];
  }

  function flushOrderedList() {
    if (orderedListItems.length === 0) {
      return;
    }

    const items = orderedListItems
      .map((item) => `<li>${renderInline(item)}</li>`)
      .join("");
    blocks.push(`<ol>${items}</ol>`);
    orderedListItems = [];
  }

  function flushCodeFence() {
    if (codeFence === null) {
      return;
    }

    const source = codeFence.lines.join("\n");

    if (codeFence.language === "mermaid") {
      blocks.push(renderMermaidBlock(source));
    } else {
      const languageClass = codeFence.language
        ? ` class="language-${escapeAttribute(codeFence.language)}"`
        : "";
      blocks.push(
        `<pre><code${languageClass}>${escapeHtml(source)}</code></pre>`,
      );
    }

    codeFence = null;
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (line.trim().startsWith("```")) {
      flushParagraph();
      flushList();
      flushOrderedList();

      if (codeFence === null) {
        codeFence = {
          language: getFenceLanguage(line),
          lines: [],
        };
      } else {
        flushCodeFence();
      }

      continue;
    }

    if (codeFence !== null) {
      codeFence.lines.push(line);
      continue;
    }

    if (line.trim() === "") {
      flushParagraph();
      flushList();
      flushOrderedList();
      continue;
    }

    if (looksLikeTableRow(line) && isTableSeparator(lines[index + 1])) {
      flushParagraph();
      flushList();
      flushOrderedList();

      const tableLines = [line, lines[index + 1]];
      index += 2;

      while (index < lines.length && looksLikeTableRow(lines[index])) {
        tableLines.push(lines[index]);
        index += 1;
      }

      index -= 1;
      blocks.push(renderTable(tableLines));
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);

    if (headingMatch) {
      flushParagraph();
      flushList();
      flushOrderedList();
      const level = headingMatch[1].length;
      const text = renderInline(headingMatch[2].trim());
      blocks.push(`<h${level}>${text}</h${level}>`);
      continue;
    }

    const listMatch = line.match(/^[-*]\s+(.*)$/);

    if (listMatch) {
      flushParagraph();
      flushOrderedList();
      listItems.push(listMatch[1].trim());
      continue;
    }

    const orderedListMatch = line.match(/^\d+\.\s+(.*)$/);

    if (orderedListMatch) {
      flushParagraph();
      flushList();
      orderedListItems.push(orderedListMatch[1].trim());
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  flushOrderedList();
  flushCodeFence();

  return blocks.join("\n");
}

function getFenceLanguage(line) {
  return line
    .trim()
    .slice(3)
    .trim()
    .split(/\s+/, 1)[0]
    ?.toLowerCase() ?? "";
}

function renderMermaidBlock(source) {
  return `
    <div class="mermaid-shell">
      <pre class="mermaid-diagram" data-mermaid-source="${escapeAttribute(encodeURIComponent(source))}">${escapeHtml(source)}</pre>
    </div>
  `;
}

function renderTable(tableLines) {
  const [headerLine, , ...rowLines] = tableLines;
  const headers = splitTableRow(headerLine);
  const rows = rowLines.map((line) => splitTableRow(line));

  const head = headers
    .map((header) => `<th>${renderInline(header)}</th>`)
    .join("");
  const body = rows
    .map((row) => {
      const cells = headers.map((_, index) => renderInline(row[index] ?? ""));
      return `<tr>${cells.map((cell) => `<td>${cell}</td>`).join("")}</tr>`;
    })
    .join("");

  return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function looksLikeTableRow(line) {
  return splitTableRow(line).length >= 2;
}

function isTableSeparator(line = "") {
  const cells = splitTableRow(line);
  return cells.length >= 2 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

async function toggleTheme() {
  const nextTheme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  persistTheme(nextTheme);
  await renderMermaidDiagrams(content);
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;

  if (!themeToggle) {
    return;
  }

  const nextAction = theme === "dark" ? "Light mode" : "Dark mode";
  themeToggle.textContent = nextAction;
  themeToggle.setAttribute("aria-label", `Switch to ${nextAction.toLowerCase()}`);
  themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
}

function getStoredTheme() {
  try {
    return localStorage.getItem("theme");
  } catch {
    return null;
  }
}

function persistTheme(theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Ignore storage failures and still allow in-memory theme switching.
  }
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getFallbackMarkdown() {
  return document.querySelector("#default-markdown")?.textContent?.trim() ?? "";
}

async function renderMermaidDiagrams(root) {
  if (!root) {
    return;
  }

  const nodes = Array.from(root.querySelectorAll(".mermaid-diagram"));

  if (nodes.length === 0) {
    return;
  }

  const mermaid = await loadMermaidModule();
  mermaid.initialize({
    startOnLoad: false,
    theme: getMermaidTheme(),
  });

  for (const node of nodes) {
    node.removeAttribute("data-processed");
    node.textContent = decodeMermaidSource(node.dataset.mermaidSource);
  }

  await mermaid.run({ nodes });
}

async function loadMermaidModule() {
  if (!mermaidModulePromise) {
    mermaidModulePromise = import("./node_modules/mermaid/dist/mermaid.esm.min.mjs")
      .then((module) => module.default ?? module)
      .catch((error) => {
        mermaidModulePromise = null;
        throw error;
      });
  }

  return mermaidModulePromise;
}

function getMermaidTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "default";
}

function decodeMermaidSource(source = "") {
  try {
    return decodeURIComponent(source);
  } catch {
    return source;
  }
}

function renderInline(text) {
  let rendered = escapeHtml(text);

  rendered = rendered.replace(
    /`([^`]+)`/g,
    (_, code) => `<code>${escapeHtml(code)}</code>`,
  );
  rendered = rendered.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, label, href) => renderLink(label, href),
  );
  rendered = rendered.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  rendered = rendered.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  return rendered;
}

function renderLink(label, href) {
  const markdownPath = resolveMarkdownPath(currentMarkdownPath ?? "index.md", href);
  const target = markdownPath ? buildMarkdownRoute(markdownPath) : href;

  return `<a href="${escapeAttribute(target)}">${escapeHtml(label)}</a>`;
}

function buildMarkdownRoute(path) {
  const params = new URLSearchParams({ doc: path });
  return `#${params.toString()}`;
}

function resolveMarkdownPath(basePath, href) {
  if (!href || href.startsWith("#")) {
    return null;
  }

  const appRoot = new URL("./", window.location.href);
  const baseDocument = new URL(basePath, appRoot);
  const resolved = new URL(href, baseDocument);

  if (resolved.origin !== appRoot.origin || !resolved.pathname.endsWith(".md")) {
    return null;
  }

  const appRootPath = appRoot.pathname;
  const relativePath = resolved.pathname.startsWith(appRootPath)
    ? resolved.pathname.slice(appRootPath.length)
    : resolved.pathname.replace(/^\//, "");

  return decodeURIComponent(relativePath);
}

function getDocumentTitle(path) {
  const label = path === "index.md" ? "Tool Researcher" : path;
  return `${label} | Tool Researcher`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
