interface ProgressBarProps {
  completed: number
  active: number
  total: number
}

export default function ProgressBar({ completed, active, total }: ProgressBarProps) {
  const safeTotal = Math.max(total, 1)
  const completedShare = total === 0 ? 0 : (completed / safeTotal) * 100
  const activeShare = total === 0 ? 0 : (active / safeTotal) * 100
  const percent = Math.round(completedShare)

  return (
    <section className="rounded-[1.75rem] border-2 border-white/70 bg-white/85 px-4 py-4 shadow-[0_18px_40px_-24px_rgba(225,29,99,0.45)] backdrop-blur-md sm:px-5 dark:border-[#ff7ab8]/40 dark:bg-[#3a1848]/90">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.16em] text-rose uppercase">Fortschritt</p>
          <p className="mt-1 font-display text-4xl leading-none text-ink dark:text-paper">
            {completed}
            <span className="ml-2 font-sans text-base font-normal text-mist dark:text-[#ffd0e4]">von {total}</span>
          </p>
        </div>
        <p className="pb-1 font-display text-2xl text-gold">{percent}%</p>
      </div>

      <div
        className="mt-4 h-3.5 overflow-hidden rounded-full bg-[#ffd0e0] dark:bg-white/15"
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${completed} von ${total} Mordokus gelöst`}
      >
        <div className="flex h-full w-full">
          <div
            className="h-full bg-sage transition-[width] duration-500"
            style={{ width: completed === 0 ? '0%' : `max(${completedShare}%, 10px)` }}
          />
          <div
            className="h-full bg-gold transition-[width] duration-500"
            style={{ width: active === 0 ? '0%' : `max(${activeShare}%, 10px)` }}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-mist dark:text-paper/65">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-sage" />
          {completed} gelöst
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-gold" />
          {active} in Arbeit
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-ink/20 dark:bg-paper/30" />
          {Math.max(total - completed - active, 0)} offen
        </span>
      </div>
    </section>
  )
}
