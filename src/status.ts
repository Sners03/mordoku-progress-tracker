import type { PuzzleStatus } from './types.ts'

export const STATUS_LABEL: Record<PuzzleStatus, string> = {
  open: 'Offen',
  'in-progress': 'In Arbeit',
  completed: 'Gelöst',
}

const STATUS_ORDER: PuzzleStatus[] = ['open', 'in-progress', 'completed']

export function nextStatus(status: PuzzleStatus): PuzzleStatus {
  const index = STATUS_ORDER.indexOf(status)
  return STATUS_ORDER[(index + 1) % STATUS_ORDER.length]
}

export function formatDay(value: string): string {
  if (!value) return 'Kein Datum'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(date)
}

export function formatTimestamp(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
