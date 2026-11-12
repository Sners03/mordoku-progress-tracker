import { useCallback, useEffect, useMemo, useState } from 'react'
import { LogOut, Moon, Plus, RefreshCw, Save, Sun } from 'lucide-react'
import AdminModal from './components/AdminModal.tsx'
import ProgressBar from './components/ProgressBar.tsx'
import PuzzleCard from './components/PuzzleCard.tsx'
import PuzzleSheet from './components/PuzzleSheet.tsx'
import { loadProgress, saveProgress } from './lib/progress.ts'
import { clearToken, readToken, storeToken } from './lib/token.ts'
import { formatTimestamp } from './status.ts'
import type { ProgressFile, ProgressSource, Puzzle, PuzzleStatus } from './types.ts'

const THEME_KEY = 'mordoku-theme'

type BoardFilter = 'all' | PuzzleStatus

const FILTERS: { id: BoardFilter; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'open', label: 'Offen' },
  { id: 'in-progress', label: 'In Arbeit' },
  { id: 'completed', label: 'Gelöst' },
]

function nextPuzzleId(puzzles: Puzzle[]): string {
  const highest = puzzles.reduce((max, puzzle) => Math.max(max, Number(puzzle.id) || 0), 0)
  return String(highest + 1)
}

function byNumber(a: Puzzle, b: Puzzle): number {
  return (Number(a.id) || 0) - (Number(b.id) || 0)
}

export default function App() {
  const [progress, setProgress] = useState<ProgressFile | null>(null)
  const [baseline, setBaseline] = useState('')
  const [source, setSource] = useState<ProgressSource | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [commitUrl, setCommitUrl] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(() => readToken())
  const [loginOpen, setLoginOpen] = useState(false)
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [filter, setFilter] = useState<BoardFilter>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const editing = token !== null
  const dirty = progress !== null && JSON.stringify(progress) !== baseline

  const counts = useMemo(() => {
    const puzzles = progress?.puzzles ?? []
    return {
      completed: puzzles.filter((puzzle) => puzzle.status === 'completed').length,
      active: puzzles.filter((puzzle) => puzzle.status === 'in-progress').length,
      open: puzzles.filter((puzzle) => puzzle.status === 'open').length,
      total: puzzles.length,
    }
  }, [progress])

  const visible = useMemo(() => {
    const puzzles = [...(progress?.puzzles ?? [])].sort(byNumber)
    const needle = query.trim().toLowerCase()
    return puzzles.filter((puzzle) => {
      if (filter !== 'all' && puzzle.status !== filter) return false
      if (!needle) return true
      return (
        puzzle.id.includes(needle) ||
        puzzle.title.toLowerCase().includes(needle) ||
        puzzle.notes.toLowerCase().includes(needle)
      )
    })
  }, [filter, progress, query])

  const selected = progress?.puzzles.find((puzzle) => puzzle.id === selectedId) ?? null

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const loaded = await loadProgress()
      setProgress(loaded.progress)
      setBaseline(JSON.stringify(loaded.progress))
      setSource(loaded.source)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Laden fehlgeschlagen.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    loadProgress()
      .then((loaded) => {
        if (cancelled) return
        setProgress(loaded.progress)
        setBaseline(JSON.stringify(loaded.progress))
        setSource(loaded.source)
        setError(null)
      })
      .catch((cause: unknown) => {
        if (cancelled) return
        setError(cause instanceof Error ? cause.message : 'Laden fehlgeschlagen.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  function updatePuzzle(id: string, patch: Partial<Omit<Puzzle, 'id'>>) {
    setProgress((current) => {
      if (!current) return current
      return {
        ...current,
        puzzles: current.puzzles.map((puzzle) => (puzzle.id === id ? { ...puzzle, ...patch } : puzzle)),
      }
    })
    setNotice(null)
  }

  function removePuzzle(id: string) {
    setProgress((current) => {
      if (!current) return current
      return { ...current, puzzles: current.puzzles.filter((puzzle) => puzzle.id !== id) }
    })
    setSelectedId(null)
    setNotice(null)
  }

  function addPuzzle() {
    if (!progress) return
    const id = nextPuzzleId(progress.puzzles)
    const puzzle: Puzzle = {
      id,
      title: `Mordoku #${id}`,
      status: 'open',
      date: '',
      notes: '',
    }
    setProgress({ ...progress, puzzles: [...progress.puzzles, puzzle] })
    setSelectedId(id)
    setNotice(null)
  }

  async function handleSave() {
    if (!progress || !token) return
    const next: ProgressFile = { ...progress, lastUpdated: new Date().toISOString() }
    setSaving(true)
    setError(null)
    setNotice(null)
    try {
      const url = await saveProgress(next, token)
      setProgress(next)
      setBaseline(JSON.stringify(next))
      setCommitUrl(url ?? null)
      setNotice(
        'Gespeichert. GitHub Actions baut die Seite jetzt neu. Es dauert etwa 30–60 Sekunden, bis die Änderung öffentlich sichtbar ist. In dieser Sitzung siehst du den neuen Stand sofort.',
      )
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  function toggleTheme() {
    setDark((current) => {
      const next = !current
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light')
      return next
    })
  }

  const closeSheet = useCallback(() => setSelectedId(null), [])

  return (
    <div className="dossier min-h-svh">
      <div className={`mx-auto flex min-h-svh w-full max-w-5xl flex-col px-3 py-4 sm:px-6 sm:py-8 ${editing ? 'pb-28' : ''}`}>
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl leading-none text-ink sm:text-5xl dark:text-paper">Mordoku</h1>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex size-10 items-center justify-center rounded-full border-2 border-white/80 bg-white text-ink shadow-sm dark:border-[#ff7ab8]/40 dark:bg-[#3a1848] dark:text-paper"
              aria-label={dark ? 'Helles Design' : 'Dunkles Design'}
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={loading || dirty}
              className="inline-flex size-10 items-center justify-center rounded-full border-2 border-white/80 bg-white text-ink shadow-sm disabled:opacity-40 dark:border-[#ff7ab8]/40 dark:bg-[#3a1848] dark:text-paper"
              aria-label="Aktualisieren"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            </button>
            {editing ? (
              <button
                type="button"
                onClick={() => {
                  clearToken()
                  setToken(null)
                  setNotice(null)
                }}
                className="inline-flex size-10 items-center justify-center rounded-full border-2 border-white/80 bg-white text-ink shadow-sm dark:border-[#ff7ab8]/40 dark:bg-[#3a1848] dark:text-paper"
                aria-label="Logout"
              >
                <LogOut className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className="rounded-full px-3 py-2 text-sm font-medium text-ink underline-offset-4 hover:underline dark:text-[#ffe0ee]"
              >
                <span className="sm:hidden">Admin</span>
                <span className="hidden sm:inline">Admin-Login</span>
              </button>
            )}
          </div>
        </header>

        <div className="mt-5">
          <ProgressBar completed={counts.completed} active={counts.active} total={counts.total} />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-mist dark:text-paper/60">
          <p>
            {progress ? `Zuletzt ${formatTimestamp(progress.lastUpdated)}` : 'Wird geladen…'}
            {editing ? ' · Bearbeiten' : ''}
          </p>
          {source === 'local' && <p>Lokale Vorlage, bis die Datei auf main liegt.</p>}
        </div>

        {notice && (
          <div className="mt-3 rounded-2xl border border-sage/30 bg-sage/10 px-4 py-3 text-sm text-ink dark:text-paper">
            <p>{notice}</p>
            {commitUrl && (
              <a className="mt-2 inline-block underline" href={commitUrl} target="_blank" rel="noreferrer">
                Commit auf GitHub öffnen
              </a>
            )}
          </div>
        )}

        {error && (
          <p className="mt-3 rounded-2xl border border-rose/30 bg-rose/10 px-4 py-3 text-sm text-rose">{error}</p>
        )}

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((item) => {
            const count =
              item.id === 'all'
                ? counts.total
                : item.id === 'completed'
                  ? counts.completed
                  : item.id === 'in-progress'
                    ? counts.active
                    : counts.open
            const active = filter === item.id
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(item.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
                  active
                    ? 'bg-ink text-paper dark:bg-paper dark:text-ink'
                    : 'border-2 border-white/70 bg-white/80 text-ink dark:border-[#ff7ab8]/30 dark:bg-[#3a1848] dark:text-[#ffe0ee]'
                }`}
              >
                {item.label} {count}
              </button>
            )
          })}
        </div>

        <label className="mt-3 block">
          <span className="sr-only">Mordoku suchen</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            inputMode="search"
            placeholder="Nummer oder Notiz, z. B. 47"
            className="w-full rounded-2xl border-2 border-white/80 bg-white/90 px-3 py-2.5 text-base text-ink outline-none ring-rose/40 placeholder:text-mist/80 focus:ring-2 dark:border-[#ff7ab8]/40 dark:bg-[#3a1848] dark:text-paper"
          />
        </label>

        {editing && (
          <button
            type="button"
            onClick={addPuzzle}
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-rose"
          >
            <Plus className="size-4" aria-hidden="true" />
            Weiteres Mordoku
          </button>
        )}

        <main className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {loading && !progress && <p className="col-span-full text-sm text-mist">Akte wird geladen…</p>}
          {progress && visible.length === 0 && (
            <p className="col-span-full rounded-3xl border border-dashed border-line px-4 py-8 text-center text-sm text-mist dark:border-white/15">
              Hier ist gerade nichts. Ein anderer Filter zeigt wieder mehr.
            </p>
          )}
          {visible.map((puzzle) => (
            <PuzzleCard key={puzzle.id} puzzle={puzzle} onOpen={() => setSelectedId(puzzle.id)} />
          ))}
        </main>

        {editing && (
          <div className="fixed inset-x-0 bottom-0 z-30 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="mx-auto max-w-5xl">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={!dirty || saving || !progress}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper shadow-[0_12px_40px_-12px_rgba(63,46,49,0.7)] disabled:opacity-40 dark:bg-paper dark:text-ink"
              >
                <Save className="size-4" aria-hidden="true" />
                {saving ? 'Speichert…' : dirty ? 'Speichern' : 'Keine Änderungen'}
              </button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <PuzzleSheet
          puzzle={selected}
          editing={editing}
          onClose={closeSheet}
          onChange={(patch) => updatePuzzle(selected.id, patch)}
          onRemove={() => removePuzzle(selected.id)}
        />
      )}

      {loginOpen && (
        <AdminModal
          onClose={() => setLoginOpen(false)}
          onSubmit={(next) => {
            storeToken(next)
            setToken(next)
            setLoginOpen(false)
          }}
        />
      )}
    </div>
  )
}
