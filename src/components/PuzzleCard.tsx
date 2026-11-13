import { Check } from 'lucide-react'
import { formatCardDay, STATUS_LABEL } from '../status.ts'
import type { Puzzle } from '../types.ts'

interface PuzzleCardProps {
  puzzle: Puzzle
  onOpen: () => void
}

const CELL = {
  open: 'glass glass-open border border-white/80 text-ink shadow-[0_10px_24px_-16px_rgba(26,18,20,0.45)] dark:border-white/25 dark:text-paper',
  'in-progress': 'glass glass-clue border border-[#c9a227] shadow-[0_10px_24px_-16px_rgba(26,18,20,0.45)]',
  completed: 'glass glass-sage border border-white/40 text-paper',
} as const

export default function PuzzleCard({ puzzle, onOpen }: PuzzleCardProps) {
  const note = puzzle.notes.trim()

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex h-full min-h-28 flex-col rounded-3xl p-3 text-left transition active:scale-[0.98] ${CELL[puzzle.status]}`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="font-display text-3xl leading-none">#{puzzle.id}</span>
        {puzzle.status === 'completed' && (
          <span className="flex size-6 items-center justify-center rounded-full bg-paper/25">
            <Check className="size-3.5" aria-hidden="true" />
          </span>
        )}
      </span>
      <span className="mt-auto pt-3 text-xs font-semibold tracking-wide opacity-80">
        {STATUS_LABEL[puzzle.status]}
      </span>
      {puzzle.status === 'completed' && puzzle.date && (
        <span className="mt-1 text-xs font-medium tracking-wide">{formatCardDay(puzzle.date)}</span>
      )}
      {note && <span className="mt-1 line-clamp-2 text-xs leading-snug opacity-90">{note}</span>}
    </button>
  )
}
