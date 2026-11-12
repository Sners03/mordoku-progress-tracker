import { Check } from 'lucide-react'
import { STATUS_LABEL } from '../status.ts'
import type { Puzzle } from '../types.ts'

interface PuzzleCardProps {
  puzzle: Puzzle
  onOpen: () => void
}

const OPEN_LIGHT = [
  'border-[#e11d63] bg-[#ffb3cc] text-[#3a1028]',
  'border-[#e8940a] bg-[#ffd27a] text-[#3a2200]',
  'border-[#0e9f6e] bg-[#8ef0cf] text-[#06382c]',
]

const OPEN_DARK = [
  'dark:border-[#ff7ab8] dark:bg-[#5a1868] dark:text-[#fff1f7]',
  'dark:border-[#ffc14d] dark:bg-[#6a3410] dark:text-[#fff6e4]',
  'dark:border-[#5eecc8] dark:bg-[#0d4a46] dark:text-[#e7fff8]',
]

const CARD_CLASS = {
  open: '',
  'in-progress':
    'border-[#e8940a] bg-[#ffbf3c] text-[#3a2200] dark:border-[#ffe08a] dark:bg-[#ffc14d] dark:text-[#3a2200]',
  completed:
    'border-[#0b7d56] bg-[#12b981] text-white dark:border-[#7dffe0] dark:bg-[#14b888] dark:text-[#04281c]',
} as const

export default function PuzzleCard({ puzzle, onOpen }: PuzzleCardProps) {
  const note = puzzle.notes.trim()
  const tone = Number(puzzle.id) % 3
  const openTone = puzzle.status === 'open' ? `${OPEN_LIGHT[tone]} ${OPEN_DARK[tone]}` : CARD_CLASS[puzzle.status]

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex h-full min-h-28 flex-col rounded-3xl border-2 p-3 text-left shadow-[0_14px_28px_-16px_rgba(58,16,40,0.55)] transition active:scale-[0.98] ${openTone}`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="font-display text-3xl leading-none">#{puzzle.id}</span>
        {puzzle.status === 'completed' && (
          <span className="flex size-6 items-center justify-center rounded-full bg-white/25">
            <Check className="size-3.5" aria-hidden="true" />
          </span>
        )}
      </span>
      <span className="mt-auto pt-3 text-xs font-semibold tracking-wide opacity-80">
        {STATUS_LABEL[puzzle.status]}
      </span>
      {note && <span className="mt-1 line-clamp-2 text-xs leading-snug opacity-90">{note}</span>}
    </button>
  )
}
