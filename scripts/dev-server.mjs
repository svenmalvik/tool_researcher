import { access, readFile, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HOST = '127.0.0.1'
const DEFAULT_PORT = 5174
const PROBE_TIMEOUT_MS = 800
const STARTUP_TIMEOUT_MS = 15000
const STARTUP_POLL_INTERVAL_MS = 250
const EXPECTED_MARKERS = ['<title>Tool Researcher</title>', '<div id="root"></div>']
const MAX_PORT_SEARCH_ATTEMPTS = 25
const AGENTS_PORT_LINE_PREFIX =
  '- The most recently started workspace dev server URL is recorded here by `npm run dev`: '
const AGENTS_PORT_LINE_REPLACE_REGEX =
  /^- The most recently started workspace dev server URL is recorded here by `npm run dev`: .+$/m
const AGENTS_PORT_LINE_REGEX =
  /^- The most recently started workspace dev server URL is recorded here by `npm run dev`: `http:\/\/127\.0\.0\.1:(\d+)\/`\.$/m

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const viteBinPath = path.resolve(repoRoot, 'node_modules', 'vite', 'bin', 'vite.js')
const agentsFilePath = path.resolve(repoRoot, 'AGENTS.md')
const preferredPort = parsePreferredPort()

const knownPort = await readRecordedPort()
const existingWorkspacePort = await findExistingWorkspacePort(preferredPort, knownPort)

if (existingWorkspacePort !== null) {
  console.log(`Dev server already running at ${toServerUrl(existingWorkspacePort)}`)
  process.exit(0)
}

try {
  await access(viteBinPath)
} catch {
  console.error('Vite is not installed yet. Run `npm install` first.')
  process.exit(1)
}

const selectedPort = await findAvailablePort(preferredPort)

if (selectedPort !== preferredPort) {
  console.log(
    `Port ${preferredPort} is already in use by another process. Starting the dev server on ${toServerUrl(selectedPort)} instead.`,
  )
}

const child = spawn(
  process.execPath,
  [viteBinPath, '--host', HOST, '--port', String(selectedPort), '--strictPort'],
  {
    cwd: repoRoot,
    stdio: 'inherit',
  },
)

void persistSuccessfulStart(selectedPort, child).catch((error) => {
  if (error instanceof Error) {
    console.error(`Failed to persist the dev server port in AGENTS.md: ${error.message}`)
    return
  }

  console.error('Failed to persist the dev server port in AGENTS.md.')
})

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

async function findExistingWorkspacePort(preferredPort, knownPort) {
  const portsToProbe = [...new Set([knownPort, preferredPort].filter(isUsablePort))]

  for (const port of portsToProbe) {
    const probeResult = await probeServer(port)

    if (probeResult === 'workspace') {
      return port
    }
  }

  return null
}

async function probeServer(port) {
  try {
    const response = await fetch(toServerUrl(port), {
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

async function findAvailablePort(startingPort) {
  for (let candidatePort = startingPort; candidatePort < startingPort + MAX_PORT_SEARCH_ATTEMPTS; candidatePort += 1) {
    if (await isPortAvailable(candidatePort)) {
      return candidatePort
    }
  }

  throw new Error(
    `Failed to find an available local port in the range ${startingPort}-${startingPort + MAX_PORT_SEARCH_ATTEMPTS - 1}.`,
  )
}

function isPortAvailable(port) {
  return new Promise((resolve, reject) => {
    const server = createServer()

    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        resolve(false)
        return
      }

      reject(error)
    })

    server.once('listening', () => {
      server.close((closeError) => {
        if (closeError) {
          reject(closeError)
          return
        }

        resolve(true)
      })
    })

    server.listen(port, HOST)
  })
}

function parsePreferredPort() {
  const candidate = Number(process.env.PORT)

  if (Number.isInteger(candidate) && candidate > 0 && candidate < 65536) {
    return candidate
  }

  return DEFAULT_PORT
}

function isUsablePort(value) {
  return Number.isInteger(value) && value > 0 && value < 65536
}

function toServerUrl(port) {
  return `http://${HOST}:${port}/`
}

async function readRecordedPort() {
  try {
    const contents = await readFile(agentsFilePath, 'utf8')
    const match = contents.match(AGENTS_PORT_LINE_REGEX)

    if (!match) {
      return null
    }

    const port = Number(match[1])

    return isUsablePort(port) ? port : null
  } catch (error) {
    if (isMissingFileError(error)) {
      return null
    }

    throw error
  }
}

async function writeRecordedPort(port) {
  const contents = await readFile(agentsFilePath, 'utf8')
  const portLine = `${AGENTS_PORT_LINE_PREFIX}\`${toServerUrl(port)}\`.`
  const nextContents = contents.includes(AGENTS_PORT_LINE_PREFIX)
    ? contents.replace(AGENTS_PORT_LINE_REPLACE_REGEX, portLine)
    : contents.replace(
        '- The dev server prefers `http://127.0.0.1:5174`.\n',
        `- The dev server prefers \`http://127.0.0.1:5174\`.\n${portLine}\n`,
      )

  if (nextContents !== contents) {
    await writeFile(agentsFilePath, nextContents, 'utf8')
  }
}

async function persistSuccessfulStart(port, child) {
  const startupDeadline = Date.now() + STARTUP_TIMEOUT_MS

  while (Date.now() < startupDeadline) {
    if (child.exitCode !== null) {
      return
    }

    if ((await probeServer(port)) === 'workspace') {
      await writeRecordedPort(port)
      return
    }

    await wait(STARTUP_POLL_INTERVAL_MS)
  }
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

function isMissingFileError(error) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'ENOENT'
  )
}
