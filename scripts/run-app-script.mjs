#!/usr/bin/env node
/** Run an app-local npm script while stripping proxy vars for local Nuxt commands. */
import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gradeApps, portalApp } from './app-registry.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const proxyEnvKeys = ['http_proxy', 'HTTP_PROXY', 'https_proxy', 'HTTPS_PROXY', 'all_proxy', 'ALL_PROXY']
const [appId, script] = process.argv.slice(2)
const app = [...gradeApps, portalApp].find((candidate) => candidate.id === appId)

if (!app || !script) {
  console.error('用法：node scripts/run-app-script.mjs <g1|g2|g3|g4|g5|g6|portal> <script>')
  process.exit(1)
}

const env = { ...process.env }
for (const key of proxyEnvKeys) delete env[key]

console.log(`\n> [${app.dir}] npm --workspace ${app.workspace} run ${script}`)
const child = spawn('npm', ['--workspace', app.workspace, 'run', script], { cwd: root, stdio: 'inherit', env })
child.on('error', (err) => {
  console.error(err)
  process.exit(1)
})
child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`${app.dir} ${script} failed with ${signal}`)
    process.exit(1)
  }
  process.exit(code ?? 1)
})
