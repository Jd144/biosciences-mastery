import { cp, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const projectRoot = process.cwd()
const now = new Date()
const stamp = now.toISOString().replace(/[:.]/g, '-')
const backupRoot = path.join(projectRoot, 'restart', 'backups', stamp)

const copyTargets = [
  'package.json',
  'package-lock.json',
  'next.config.ts',
  'tsconfig.json',
  'eslint.config.mjs',
  'src',
  'public',
  'supabase',
]

async function exists(targetPath) {
  try {
    await stat(targetPath)
    return true
  } catch {
    return false
  }
}

async function parseEnvKeysFromReadme() {
  const readmePath = path.join(projectRoot, 'README.md')
  if (!(await exists(readmePath))) return []

  const content = await readFile(readmePath, 'utf8')
  const matches = content.match(/^[A-Z0-9_]+=/gm) ?? []
  return [...new Set(matches.map((line) => line.replace('=', '')))].sort()
}

async function walk(dir, collected = []) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(full, collected)
    } else {
      collected.push(full)
    }
  }
  return collected
}

function normalizeRoute(filePath) {
  const appRoot = path.join(projectRoot, 'src', 'app')
  const relativePath = path.relative(appRoot, filePath).replace(/\\/g, '/')

  if (relativePath.endsWith('/page.tsx')) {
    const routePath = relativePath
      .replace(/\/page\.tsx$/, '')
      .replace(/^$/, '')
      .replace(/^\(.*?\)\//g, '')
    return routePath ? `/${routePath}` : '/'
  }

  if (relativePath.endsWith('/route.ts')) {
    return `/${relativePath.replace(/\/route\.ts$/, '')}`
  }

  return null
}

async function collectRouteInventory() {
  const appDir = path.join(projectRoot, 'src', 'app')
  if (!(await exists(appDir))) return { pages: [], apiRoutes: [] }

  const files = await walk(appDir)
  const pages = []
  const apiRoutes = []

  for (const file of files) {
    if (!file.endsWith('/page.tsx') && !file.endsWith('/route.ts')) continue
    const route = normalizeRoute(file)
    if (!route) continue
    if (route.startsWith('/api/')) {
      apiRoutes.push(route)
    } else {
      pages.push(route)
    }
  }

  return {
    pages: [...new Set(pages)].sort(),
    apiRoutes: [...new Set(apiRoutes)].sort(),
  }
}

async function copySnapshot() {
  await mkdir(backupRoot, { recursive: true })

  for (const target of copyTargets) {
    const source = path.join(projectRoot, target)
    if (!(await exists(source))) continue
    const destination = path.join(backupRoot, target)
    await cp(source, destination, { recursive: true })
  }
}

async function main() {
  await copySnapshot()

  const envKeys = await parseEnvKeysFromReadme()
  const routeInventory = await collectRouteInventory()

  const manifest = {
    createdAt: now.toISOString(),
    backupPath: backupRoot,
    copiedTargets: copyTargets,
    envKeys,
    routeInventory,
    database: {
      schema: 'supabase/schema.sql',
      migrationsDirectory: 'supabase/migrations',
      seed: 'supabase/seed.sql',
    },
  }

  const manifestPath = path.join(backupRoot, 'snapshot-manifest.json')
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')

  process.stdout.write(`${manifestPath}\n`)
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`)
  process.exitCode = 1
})
