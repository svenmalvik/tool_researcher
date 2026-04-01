import { promises as fs } from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin, type ResolvedConfig } from 'vite'

const MARKDOWN_ROOT_FILES = ['README.md', 'index.md']
const GENERATED_PUBLIC_DIR = '.content-cache'

function markdownContentPlugin(): Plugin {
  let config: ResolvedConfig

  return {
    name: 'tool-research-markdown-content',
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    async buildStart() {
      await syncMarkdownContent(config.root)
    },
    configureServer(server) {
      const syncController = createMarkdownSyncController(
        config.root,
        (error) => {
          server.config.logger.error(
            `[tool-research-markdown-content] ${error.message}`,
          )
        },
      )

      void syncController.sync()

      server.middlewares.use(async (req, res, next) => {
        if (!isTrackedMarkdownRequest(req.url)) {
          next()
          return
        }

        await syncController.waitForIdle()

        const syncError = syncController.getLastError()

        if (syncError) {
          res.statusCode = 503
          res.setHeader('Cache-Control', 'no-store')
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          res.setHeader('X-Markdown-Sync-Status', 'error')
          res.end(`Markdown sync failed: ${syncError.message}`)
          return
        }

        next()
      })

      const resync = (filePath: string): void => {
        if (!isTrackedMarkdownPath(config.root, filePath)) {
          return
        }

        void syncController.sync()
      }

      server.watcher.on('add', resync)
      server.watcher.on('change', resync)
      server.watcher.on('unlink', resync)
      server.watcher.on('addDir', resync)
      server.watcher.on('unlinkDir', resync)
    },
  }
}

function createMarkdownSyncController(
  rootDirectory: string,
  reportError: (error: Error) => void,
): {
  getLastError: () => Error | null
  sync: () => Promise<void>
  waitForIdle: () => Promise<void>
} {
  let activeSync: Promise<void> | null = null
  let rerunRequested = false
  let lastError: Error | null = null
  const idleWaiters = new Set<() => void>()

  const notifyIdleWaiters = (): void => {
    for (const resolve of idleWaiters) {
      resolve()
    }

    idleWaiters.clear()
  }

  const runSyncLoop = async (): Promise<void> => {
    try {
      do {
        rerunRequested = false

        try {
          await syncMarkdownContent(rootDirectory)
          lastError = null
        } catch (error) {
          lastError = toError(error)
          reportError(lastError)
        }
      } while (rerunRequested)
    } finally {
      activeSync = null
      notifyIdleWaiters()
    }
  }

  return {
    getLastError() {
      return lastError
    },
    sync() {
      if (activeSync) {
        rerunRequested = true
        return activeSync
      }

      activeSync = runSyncLoop()
      return activeSync
    },
    waitForIdle() {
      if (!activeSync) {
        return Promise.resolve()
      }

      return new Promise((resolve) => {
        idleWaiters.add(resolve)
      })
    },
  }
}

async function syncMarkdownContent(rootDirectory: string): Promise<void> {
  const publicDirectory = path.resolve(rootDirectory, GENERATED_PUBLIC_DIR)
  await fs.rm(publicDirectory, { force: true, recursive: true })
  await fs.mkdir(publicDirectory, { recursive: true })

  for (const relativePath of MARKDOWN_ROOT_FILES) {
    await copyFileIfPresent(relativePath, publicDirectory, rootDirectory)
  }

  await copyDirectoryIfPresent('research', publicDirectory, rootDirectory)
}

function isTrackedMarkdownPath(rootDirectory: string, filePath: string): boolean {
  const absoluteRoot = path.resolve(rootDirectory)
  const absoluteFile = path.resolve(filePath)

  if (!absoluteFile.startsWith(`${absoluteRoot}${path.sep}`)) {
    return false
  }

  const relativePath = path.relative(absoluteRoot, absoluteFile)

  return (
    MARKDOWN_ROOT_FILES.includes(relativePath) ||
    relativePath === 'research' ||
    relativePath.startsWith(`research${path.sep}`)
  )
}

function isTrackedMarkdownRequest(requestUrl: string | undefined): boolean {
  if (!requestUrl) {
    return false
  }

  const requestPath = requestUrl.split('?')[0].replace(/^\/+/, '')

  return (
    MARKDOWN_ROOT_FILES.includes(requestPath) ||
    requestPath === 'research' ||
    requestPath.startsWith('research/')
  )
}

async function copyFileIfPresent(
  relativePath: string,
  outputDirectory: string,
  rootDirectory: string,
): Promise<void> {
  const sourcePath = path.resolve(rootDirectory, relativePath)

  try {
    const stats = await fs.stat(sourcePath)

    if (!stats.isFile()) {
      return
    }

    const destinationPath = path.resolve(outputDirectory, relativePath)
    await fs.mkdir(path.dirname(destinationPath), { recursive: true })
    await fs.copyFile(sourcePath, destinationPath)
  } catch (error) {
    if (isMissingFileError(error)) {
      return
    }

    throw error
  }
}

async function copyDirectoryIfPresent(
  relativePath: string,
  outputDirectory: string,
  rootDirectory: string,
): Promise<void> {
  const sourcePath = path.resolve(rootDirectory, relativePath)

  try {
    const stats = await fs.stat(sourcePath)

    if (!stats.isDirectory()) {
      return
    }

    const destinationPath = path.resolve(outputDirectory, relativePath)
    await fs.mkdir(path.dirname(destinationPath), { recursive: true })
    await fs.cp(sourcePath, destinationPath, { recursive: true })
  } catch (error) {
    if (isMissingFileError(error)) {
      return
    }

    throw error
  }
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'ENOENT'
  )
}

function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error
  }

  return new Error(String(error))
}

export default defineConfig({
  publicDir: GENERATED_PUBLIC_DIR,
  plugins: [react(), markdownContentPlugin()],
})
