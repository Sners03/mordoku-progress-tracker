export type PuzzleStatus = 'open' | 'in-progress' | 'completed'

export interface Puzzle {
  id: string
  title: string
  status: PuzzleStatus
  date: string
  notes: string
  solvedAt?: string
}

export interface ProgressFile {
  lastUpdated: string
  puzzles: Puzzle[]
}

export type ProgressSource = 'github' | 'local'
