import { useEffect, useId, useState } from 'react'
import { Trash2, X } from 'lucide-react'
import { formatDay, nextStatus, STATUS_LABEL } from '../status.ts'
import type { Puzzle } from '../types.ts'

interface PuzzleSheetProps {
  puzzle: Puzzle
  editing: boolean
  onClose: () => void
  onChange: (patch: Partial<Omit<Puzzle, 'id'>>) => void
  onRemove: () => void
}

export default function PuzzleSheet({ puzzle, editing, onClose, onChange, onRemove }: PuzzleSheetProps) {
  const titleId = useId()
  const [confirmRemove, setConfirmRemove] = useState(false)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" aria-label="Schließen" onClick={onClose} />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[88svh] w-full overflow-y-auto rounded-t-[1.75rem] border border-line bg-card px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-w-lg sm:rounded-[1.75rem] sm:p-6 dark:border-white/10 dark:bg-dusk"
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-line sm:hidden dark:bg-white/15" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.16em] text-gold uppercase">Mordoku</p>
            <h2 id={titleId} className="font-display text-4xl text-ink dark:text-paper">
              #{puzzle.id}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-10 items-center justify-center rounded-full bg-paper text-ink dark:bg-night dark:text-paper"
            aria-label="Karte schließen"
          >
            <X className="size-4" />
          </button>
        </div>

        {editing ? (
          <label className="mt-4 block text-xs text-mist">
            Titel
            <input
              value={puzzle.title}
              onChange={(event) => onChange({ title: event.target.value })}
              className="mt-1 w-full rounded-2xl border border-line bg-paper px-3 py-2.5 text-base text-ink outline-none ring-gold/40 focus:ring-2 dark:border-white/10 dark:bg-night dark:text-paper"
            />
          </label>
        ) : (
          <p className="mt-2 text-lg text-ink dark:text-paper">{puzzle.title}</p>
        )}

        <div className="mt-4">
          {editing ? (
            <button
              type="button"
              onClick={() => onChange({ status: nextStatus(puzzle.status) })}
              className="rounded-full bg-rose/15 px-4 py-2 text-sm font-medium text-rose"
            >
              {STATUS_LABEL[puzzle.status]} · tippen zum Wechseln
            </button>
          ) : (
            <p className="text-sm text-mist dark:text-paper/70">{STATUS_LABEL[puzzle.status]}</p>
          )}
        </div>

        {editing ? (
          <label className="mt-4 block text-xs text-mist">
            Datum
            <input
              type="date"
              value={puzzle.date}
              onChange={(event) => onChange({ date: event.target.value })}
              className="mt-1 w-full rounded-2xl border border-line bg-paper px-3 py-2.5 text-base text-ink outline-none ring-gold/40 focus:ring-2 dark:border-white/10 dark:bg-night dark:text-paper"
            />
          </label>
        ) : (
          <p className="mt-4 text-sm text-mist dark:text-paper/70">{formatDay(puzzle.date)}</p>
        )}

        {editing ? (
          <label className="mt-4 block text-xs text-mist">
            Notiz
            <textarea
              value={puzzle.notes}
              rows={4}
              onChange={(event) => onChange({ notes: event.target.value })}
              placeholder="Woran hängt ihr gerade?"
              className="mt-1 w-full resize-y rounded-2xl border border-line bg-paper px-3 py-2.5 text-base text-ink outline-none ring-gold/40 focus:ring-2 dark:border-white/10 dark:bg-night dark:text-paper"
            />
          </label>
        ) : (
          <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap text-ink/85 dark:text-paper/85">
            {puzzle.notes.trim() ? puzzle.notes : 'Noch keine Notiz. Das darf so bleiben.'}
          </p>
        )}

        {editing && (
          <button
            type="button"
            onClick={() => {
              if (!confirmRemove) {
                setConfirmRemove(true)
                return
              }
              onRemove()
            }}
            className="mt-5 inline-flex items-center gap-1.5 text-sm text-rose"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            {confirmRemove ? 'Wirklich entfernen' : 'Aus der Akte nehmen'}
          </button>
        )}
      </section>
    </div>
  )
}
