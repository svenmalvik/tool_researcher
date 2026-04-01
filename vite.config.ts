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
      void syncMarkdownContent(config.root)

      const resync = (filePath: string): void => {
        if (!isTrackedMarkdownPath(config.root, filePath)) {
          return
        }

        void syncMarkdownContent(config.root)
      }

      server.watcher.on('add', resync)
      server.watcher.on('change', resync)
      server.watcher.on('unlink', resync)
      server.watcher.on('addDir', resync)
      server.watcher.on('unlinkDir', resync)
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

export default defineConfig({
  publicDir: GENERATED_PUBLIC_DIR,
  plugins: [react(), markdownContentPlugin()],
})
