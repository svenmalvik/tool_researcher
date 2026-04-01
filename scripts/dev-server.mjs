import { access } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HOST = '127.0.0.1'
const PORT = 5174
const SERVER_URL = `http://${HOST}:${PORT}/`
const PROBE_TIMEOUT_MS = 800
const EXPECTED_MARKERS = ['<title>Tool Researcher</title>', '<div id="root"></div>']

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const viteBinPath = path.resolve(repoRoot, 'node_modules', 'vite', 'bin', 'vite.js')

const probeResult = await probeExistingServer()

if (probeResult === 'workspace') {
  console.log(`Dev server already running at ${SERVER_URL}`)
  process.exit(0)
}

if (probeResult === 'other-process') {
  console.error(
    `Port ${PORT} is already in use by a different process. Stop that process or use the existing workspace server at ${SERVER_URL}.`,
  )
  process.exit(1)
}

try {
  await access(viteBinPath)
} catch {
  console.error('Vite is not installed yet. Run `npm install` first.')
  process.exit(1)
}

const child = spawn(
  process.execPath,
  [viteBinPath, '--host', HOST, '--port', String(PORT), '--strictPort'],
  {
    cwd: repoRoot,
    stdio: 'inherit',
  },
)

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 1)
})

child.on('error', (error) => {
  console.error(`Failed to start the dev server: ${error.message}`)
  process.exit(1)
})

async function probeExistingServer() {
  try {
    const response = await fetch(SERVER_URL, {
      headers: { accept: 'text/html' },
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    })

    const body = await response.text()

    if (response.ok && EXPECTED_MARKERS.every((marker) => body.includes(marker))) {
      return 'workspace'
    }

    return 'other-process'
  } catch {
    return 'not-running'
  }
}
