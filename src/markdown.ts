export type Notice = {
  kind: 'info' | 'warning'
  message: string
}

export const FALLBACK_MARKDOWN = `# Tool Researcher

This repository starts as a research workspace, not a finished report.

## How the workspace should evolve

- Keep the root \`README.md\` and \`index.md\` as starter guidance while the evaluation is being scoped.
- After the short intake, create the live package under \`research/\`, starting with \`research/00-task-list.md\` and \`research/index.md\`.
- Build the detailed analysis in \`research/\` throughout the run.
- Overwrite the root \`README.md\` and \`index.md\` only in the final publishing step.

## What the app prefers

When \`research/index.md\` exists, the app should render that package first.
The root files stay reserved for the finished one-pager and website landing page.

## What to do next

Start a conversation with the AI, complete the short intake, and let it build the research package under \`research/\`.`

type RenderOptions = {
  basePath: string
  notice?: Notice
}

export function renderMarkdownDocument(
  markdown: string,
  options: RenderOptions,
): string {
  const noticeMarkup = options.notice
    ? `
      <div class="content-notice content-notice--${options.notice.kind}">
        <p>${escapeHtml(options.notice.message)}</p>
      </div>
    `
    : ''

  return `${noticeMarkup}${renderMarkdown(markdown, options.basePath)}`
}

export function renderErrorState(heading: string, message: string): string {
  return `
    <div class="error-state">
      <h2>${escapeHtml(heading)}</h2>
      <p>${escapeHtml(message)}</p>
    </div>
  `
}

function renderMarkdown(markdown: string, basePath: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: string[] = []
  let paragraph: string[] = []
  let listItems: string[] = []
  let orderedListItems: string[] = []
  let codeFence: { language: string; lines: string[] } | null = null

  function flushParagraph(): void {
    if (paragraph.length === 0) {
      return
    }

    blocks.push(`<p>${renderInline(paragraph.join(' '), basePath)}</p>`)
    paragraph = []
  }

  function flushList(): void {
    if (listItems.length === 0) {
      return
    }

    const items = listItems
      .map((item) => `<li>${renderInline(item, basePath)}</li>`)
      .join('')
    blocks.push(`<ul>${items}</ul>`)
    listItems = []
  }

  function flushOrderedList(): void {
    if (orderedListItems.length === 0) {
      return
    }

    const items = orderedListItems
      .map((item) => `<li>${renderInline(item, basePath)}</li>`)
      .join('')
    blocks.push(`<ol>${items}</ol>`)
    orderedListItems = []
  }

  function flushCodeFence(): void {
    if (codeFence === null) {
      return
    }

    const source = codeFence.lines.join('\n')

    if (codeFence.language === 'mermaid') {
      blocks.push(renderMermaidBlock(source))
    } else {
      const languageClass = codeFence.language
        ? ` class="language-${escapeAttribute(codeFence.language)}"`
        : ''
      blocks.push(
        `<pre><code${languageClass}>${escapeHtml(source)}</code></pre>`,
      )
    }

    codeFence = null
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]

    if (line.trim().startsWith('```')) {
      flushParagraph()
      flushList()
      flushOrderedList()

      if (codeFence === null) {
        codeFence = {
          language: getFenceLanguage(line),
          lines: [],
        }
      } else {
        flushCodeFence()
      }

      continue
    }

    if (codeFence !== null) {
      codeFence.lines.push(line)
      continue
    }

    if (line.trim() === '') {
      flushParagraph()
      flushList()
      flushOrderedList()
      continue
    }

    if (looksLikeTableRow(line) && isTableSeparator(lines[index + 1])) {
      flushParagraph()
      flushList()
      flushOrderedList()

      const tableLines = [line, lines[index + 1]]
      index += 2

      while (index < lines.length && looksLikeTableRow(lines[index])) {
        tableLines.push(lines[index])
        index += 1
      }

      index -= 1
      blocks.push(renderTable(tableLines, basePath))
      continue
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)

    if (headingMatch) {
      flushParagraph()
      flushList()
      flushOrderedList()
      const level = headingMatch[1].length
      const text = renderInline(headingMatch[2].trim(), basePath)
      blocks.push(`<h${level}>${text}</h${level}>`)
      continue
    }

    const listMatch = line.match(/^[-*]\s+(.*)$/)

    if (listMatch) {
      flushParagraph()
      flushOrderedList()
      listItems.push(listMatch[1].trim())
      continue
    }

    const orderedListMatch = line.match(/^\d+\.\s+(.*)$/)

    if (orderedListMatch) {
      flushParagraph()
      flushList()
      orderedListItems.push(orderedListMatch[1].trim())
      continue
    }

    paragraph.push(line.trim())
  }

  flushParagraph()
  flushList()
  flushOrderedList()
  flushCodeFence()

  return blocks.join('\n')
}

function getFenceLanguage(line: string): string {
  return (
    line
      .trim()
      .slice(3)
      .trim()
      .split(/\s+/, 1)[0]
      ?.toLowerCase() ?? ''
  )
}

function renderMermaidBlock(source: string): string {
  return `
    <div class="mermaid-shell">
      <pre class="mermaid-diagram" data-mermaid-source="${escapeAttribute(encodeURIComponent(source))}">${escapeHtml(source)}</pre>
    </div>
  `
}

function renderTable(tableLines: string[], basePath: string): string {
  const [headerLine, , ...rowLines] = tableLines
  const headers = splitTableRow(headerLine)
  const rows = rowLines.map((line) => splitTableRow(line))

  const head = headers
    .map((header) => `<th>${renderInline(header, basePath)}</th>`)
    .join('')
  const body = rows
    .map((row) => {
      const cells = headers.map((_, index) =>
        renderInline(row[index] ?? '', basePath),
      )
      return `<tr>${cells.map((cell) => `<td>${cell}</td>`).join('')}</tr>`
    })
    .join('')

  return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`
}

function looksLikeTableRow(line: string): boolean {
  return splitTableRow(line).length >= 2
}

function isTableSeparator(line = ''): boolean {
  const cells = splitTableRow(line)
  return cells.length >= 2 && cells.every((cell) => /^:?-{3,}:?$/.test(cell))
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function renderInline(text: string, basePath: string): string {
  let rendered = escapeHtml(text)

  rendered = rendered.replace(
    /`([^`]+)`/g,
    (_match, code) => `<code>${escapeHtml(code)}</code>`,
  )
  rendered = rendered.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) =>
    renderLink(label, href, basePath),
  )
  rendered = rendered.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  rendered = rendered.replace(/\*([^*]+)\*/g, '<em>$1</em>')

  return rendered
}

function renderLink(label: string, href: string, basePath: string): string {
  const markdownPath = resolveMarkdownPath(basePath, href)
  const target = markdownPath ? buildMarkdownRoute(markdownPath) : sanitizeHref(href)

  return `<a href="${escapeAttribute(target)}">${escapeHtml(label)}</a>`
}

function buildMarkdownRoute(path: string): string {
  const params = new URLSearchParams({ doc: path })
  return `#${params.toString()}`
}

export function getRequestedMarkdownPath(): string | null {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const requestedPath = params.get('doc')

  if (!requestedPath) {
    return null
  }

  return resolveMarkdownPath('index.md', requestedPath)
}

export function resolveMarkdownPath(
  basePath: string,
  href: string,
): string | null {
  if (!href || href.startsWith('#')) {
    return null
  }

  const appRoot = new URL('./', window.location.href)
  const baseDocument = new URL(basePath, appRoot)
  const resolved = new URL(href, baseDocument)

  if (resolved.origin !== appRoot.origin || !resolved.pathname.endsWith('.md')) {
    return null
  }

  const appRootPath = appRoot.pathname
  const relativePath = resolved.pathname.startsWith(appRootPath)
    ? resolved.pathname.slice(appRootPath.length)
    : resolved.pathname.replace(/^\//, '')

  return decodeURIComponent(relativePath)
}

export function getDocumentTitle(path: string): string {
  const label = path === 'index.md' ? 'Tool Researcher' : path
  return `${label} | Tool Researcher`
}

export function decodeMermaidSource(source = ''): string {
  try {
    return decodeURIComponent(source)
  } catch {
    return source
  }
}

function sanitizeHref(href: string): string {
  return /^\s*javascript:/i.test(href) ? '#' : href
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttribute(value: string): string {
  return escapeHtml(value)
}
