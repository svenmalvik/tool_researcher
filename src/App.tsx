import { startTransition, useEffect, useRef, useState } from 'react'
import {
  FALLBACK_MARKDOWN,
  decodeMermaidSource,
  getDocumentTitle,
  getRequestedMarkdownPath,
  renderErrorState,
  renderMarkdownDocument,
} from './markdown'

type RenderState = {
  currentMarkdownPath: string
  html: string
  title: string
}

type MarkdownFetchResult = {
  markdown: string
  path: string
}

const DEFAULT_MARKDOWN_PATH = 'index.md'
const INITIAL_HTML =
  '<p class="status">Loading <code>index.md</code>&hellip;</p>'
const PREFERRED_MARKDOWN_PATHS = ['research/index.md', DEFAULT_MARKDOWN_PATH]
let mermaidModulePromise: Promise<MermaidModule> | null = null

export default function App(): React.JSX.Element {
  const [theme, setTheme] = useState(() => getStoredTheme() ?? getSystemTheme())
  const [renderState, setRenderState] = useState<RenderState>({
    currentMarkdownPath: DEFAULT_MARKDOWN_PATH,
    html: INITIAL_HTML,
    title: 'Tool Researcher',
  })
  const contentRef = useRef<HTMLElement | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    document.title = renderState.title
  }, [renderState.title])

  useEffect(() => {
    const handleHashChange = () => {
      void loadMarkdown()
    }

    void loadMarkdown()
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      requestIdRef.current += 1
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  useEffect(() => {
    const root = contentRef.current

    if (!root) {
      return
    }

    let cancelled = false

    const renderDiagrams = async (): Promise<void> => {
      const nodes = Array.from(
        root.querySelectorAll<HTMLElement>('.mermaid-diagram'),
      )

      if (nodes.length === 0) {
        return
      }

      const mermaid = await loadMermaidModule()

      mermaid.initialize({
        startOnLoad: false,
        theme: theme === 'dark' ? 'dark' : 'default',
      })

      for (const node of nodes) {
        node.removeAttribute('data-processed')
        node.textContent = decodeMermaidSource(node.dataset.mermaidSource)
      }

      try {
        await mermaid.run({ nodes })
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to render Mermaid diagrams.', error)
        }
      }
    }

    void renderDiagrams()

    return () => {
      cancelled = true
    }
  }, [renderState.html, theme])

  async function loadMarkdown(): Promise<void> {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    if (window.location.protocol === 'file:') {
      updateRenderState(requestId, {
        currentMarkdownPath: DEFAULT_MARKDOWN_PATH,
        html: renderMarkdownDocument(FALLBACK_MARKDOWN, {
          basePath: DEFAULT_MARKDOWN_PATH,
          notice: {
            kind: 'info',
            message:
              'Opened from disk. Browsers block reading sibling Markdown files over file://, so this page is showing the built-in starter content.',
          },
        }),
        title: getDocumentTitle(DEFAULT_MARKDOWN_PATH),
      })
      return
    }

    const requestedPath = getRequestedMarkdownPath()

    try {
      const result = requestedPath
        ? await fetchMarkdown(requestedPath)
        : await fetchPreferredMarkdown(PREFERRED_MARKDOWN_PATHS)

      updateRenderState(requestId, {
        currentMarkdownPath: result.path,
        html: renderMarkdownDocument(result.markdown, {
          basePath: result.path,
        }),
        title: getDocumentTitle(result.path),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'

      if (requestedPath) {
        updateRenderState(requestId, {
          currentMarkdownPath: requestedPath,
          html: renderErrorState(
            `Could not render ${requestedPath}`,
            message,
          ),
          title: getDocumentTitle(requestedPath),
        })
        return
      }

      updateRenderState(requestId, {
        currentMarkdownPath: DEFAULT_MARKDOWN_PATH,
        html: renderMarkdownDocument(FALLBACK_MARKDOWN, {
          basePath: DEFAULT_MARKDOWN_PATH,
          notice: {
            kind: 'warning',
            message: `Could not load index.md directly. Showing the built-in starter content instead. (${message})`,
          },
        }),
        title: getDocumentTitle(DEFAULT_MARKDOWN_PATH),
      })
    }
  }

  function updateRenderState(requestId: number, nextState: RenderState): void {
    if (requestId !== requestIdRef.current) {
      return
    }

    startTransition(() => {
      setRenderState(nextState)
    })
  }

  function handleThemeToggle(): void {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark'
      persistTheme(nextTheme)
      return nextTheme
    })
  }

  const nextThemeLabel = theme === 'dark' ? 'Light mode' : 'Dark mode'

  return (
    <div className="page-shell">
      <header className="hero">
        <div className="hero-top">
          <p className="eyebrow">Template</p>
          <button
            aria-label={`Switch to ${nextThemeLabel.toLowerCase()}`}
            aria-pressed={theme === 'dark'}
            className="theme-toggle"
            id="theme-toggle"
            onClick={handleThemeToggle}
            type="button"
          >
            {nextThemeLabel}
          </button>
        </div>
        <h1>Tool Researcher</h1>
        <p className="lede">
          A Vite-powered starting page that renders the repository&apos;s{' '}
          <code>index.md</code>.
        </p>
      </header>

      <main>
        <article
          aria-live="polite"
          className="content-card"
          id="content"
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: renderState.html }}
        />
      </main>
    </div>
  )
}

async function fetchMarkdown(path: string): Promise<MarkdownFetchResult> {
  const response = await fetch(path, { cache: 'no-store' })

  if (!response.ok) {
    throw new Error(`Failed to load ${path} (${response.status})`)
  }

  const contentType = response.headers.get('content-type') ?? ''
  const markdown = await response.text()

  if (looksLikeHtmlFallback(markdown, contentType)) {
    throw new Error(`Received HTML instead of Markdown for ${path}`)
  }

  return {
    markdown,
    path,
  }
}

async function fetchPreferredMarkdown(
  paths: string[],
): Promise<MarkdownFetchResult> {
  let lastError: unknown = null

  for (const path of paths) {
    try {
      return await fetchMarkdown(path)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError ?? new Error('Failed to load markdown content')
}

function applyTheme(theme: string): void {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

function getStoredTheme(): string | null {
  try {
    return localStorage.getItem('theme')
  } catch {
    return null
  }
}

function persistTheme(theme: string): void {
  try {
    localStorage.setItem('theme', theme)
  } catch {
    // Ignore storage failures and still allow in-memory theme switching.
  }
}

function getSystemTheme(): string {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function looksLikeHtmlFallback(markdown: string, contentType: string): boolean {
  const normalizedContentType = contentType.toLowerCase()
  const trimmed = markdown.trimStart().toLowerCase()

  return (
    normalizedContentType.includes('text/html') ||
    trimmed.startsWith('<!doctype html') ||
    trimmed.startsWith('<html')
  )
}

type MermaidModule = {
  initialize: (config: { startOnLoad: boolean; theme: string }) => void
  run: (config: { nodes: HTMLElement[] }) => Promise<void>
}

async function loadMermaidModule(): Promise<MermaidModule> {
  if (!mermaidModulePromise) {
    mermaidModulePromise = import('mermaid').then(
      (module) => (module.default ?? module) as MermaidModule,
    )
  }

  return mermaidModulePromise
}
