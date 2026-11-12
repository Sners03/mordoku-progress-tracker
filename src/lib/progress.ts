import { GITHUB_CONFIG } from '../config.ts'
import type { ProgressFile, ProgressSource, Puzzle, PuzzleStatus } from '../types.ts'

const STATUSES = new Set<PuzzleStatus>(['open', 'in-progress', 'completed'])

export interface LoadedProgress {
  progress: ProgressFile
  source: ProgressSource
}

function isPuzzle(value: unknown): value is Puzzle {
  if (!value || typeof value !== 'object') return false
  const puzzle = value as Record<string, unknown>
  return (
    typeof puzzle.id === 'string' &&
    typeof puzzle.title === 'string' &&
    typeof puzzle.status === 'string' &&
    STATUSES.has(puzzle.status as PuzzleStatus) &&
    typeof puzzle.date === 'string' &&
    typeof puzzle.notes === 'string'
  )
}

function parseProgress(value: unknown): ProgressFile {
  if (!value || typeof value !== 'object') {
    throw new Error('progress.json hat ein ungültiges Format.')
  }

  const data = value as Record<string, unknown>
  if (typeof data.lastUpdated !== 'string' || !Array.isArray(data.puzzles)) {
    throw new Error('progress.json hat ein ungültiges Format.')
  }
  if (!data.puzzles.every(isPuzzle)) {
    throw new Error('Mindestens ein Mordoku-Eintrag ist unvollständig.')
  }

  return {
    lastUpdated: data.lastUpdated,
    puzzles: data.puzzles,
  }
}

async function readProgress(url: string): Promise<ProgressFile | null> {
  try {
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) return null
    return parseProgress(await response.json())
  } catch {
    return null
  }
}

export async function loadProgress(): Promise<LoadedProgress> {
  const remote = `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${GITHUB_CONFIG.filePath}?t=${Date.now()}`
  const fromGitHub = await readProgress(remote)
  if (fromGitHub) return { progress: fromGitHub, source: 'github' }

  const local = `${import.meta.env.BASE_URL}progress.json?t=${Date.now()}`
  const fromDisk = await readProgress(local)
  if (fromDisk) return { progress: fromDisk, source: 'local' }

  throw new Error('progress.json konnte nicht geladen werden.')
}

function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function contentsUrl(): string {
  const path = GITHUB_CONFIG.filePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  return `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}`
}

function githubHeaders(token: string): HeadersInit {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  }
}

async function githubError(response: Response): Promise<Error> {
  let detail = `GitHub hat mit Status ${response.status} geantwortet.`
  try {
    const data = (await response.json()) as { message?: string }
    if (data.message) detail = data.message
  } catch {
    // Response body was not JSON.
  }

  if (response.status === 401) {
    return new Error(`Token abgelehnt. ${detail}`)
  }
  if (response.status === 403) {
    return new Error(
      `Keine Schreibrechte. Der Fine-Grained PAT braucht Zugriff auf Contents dieses Repos. ${detail}`,
    )
  }
  if (response.status === 404) {
    return new Error(`Repository oder Datei nicht gefunden. ${detail}`)
  }
  if (response.status === 409) {
    return new Error(
      `Die Datei wurde zwischenzeitlich geändert. Bitte neu laden und erneut speichern. ${detail}`,
    )
  }
  return new Error(detail)
}

async function githubFetch(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch {
    throw new Error('Keine Verbindung zu GitHub.')
  }
}

export async function saveProgress(progress: ProgressFile, token: string): Promise<string | undefined> {
  const url = contentsUrl()
  const headers = githubHeaders(token)
  const current = await githubFetch(
    `${url}?ref=${encodeURIComponent(GITHUB_CONFIG.branch)}`,
    { headers, cache: 'no-store' },
  )

  let sha: string | undefined
  if (current.ok) {
    const data = (await current.json()) as { sha?: string }
    sha = data.sha
  } else if (current.status !== 404) {
    throw await githubError(current)
  }

  const saved = await githubFetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: 'Update Mordoku progress',
      content: encodeBase64(`${JSON.stringify(progress, null, 2)}\n`),
      branch: GITHUB_CONFIG.branch,
      ...(sha ? { sha } : {}),
    }),
  })

  if (!saved.ok) throw await githubError(saved)

  const result = (await saved.json()) as { commit?: { html_url?: string } }
  return result.commit?.html_url
}
