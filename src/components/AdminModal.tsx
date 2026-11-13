import { useEffect, useId, useState } from 'react'
import { Eye, EyeOff, KeyRound } from 'lucide-react'
import { GITHUB_CONFIG } from '../config.ts'

interface AdminModalProps {
  onClose: () => void
  onSubmit: (token: string) => void
}

export default function AdminModal({ onClose, onSubmit }: AdminModalProps) {
  const titleId = useId()
  const [token, setToken] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-ink/60 backdrop-blur-[2px]"
        aria-label="Dialog schließen"
        onClick={onClose}
      />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md rounded-3xl border border-line bg-card p-6 shadow-2xl dark:border-white/10 dark:bg-dusk"
        onSubmit={(event) => {
          event.preventDefault()
          const next = token.trim()
          if (!next) return
          onSubmit(next)
        }}
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full border border-rose/40 bg-blood/10 text-blood">
            <KeyRound className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id={titleId} className="font-display text-2xl text-ink dark:text-paper">
              Admin-Login
            </h2>
            <p className="text-sm text-mist dark:text-paper/70">Schreibzugriff nur mit GitHub-Token</p>
          </div>
        </div>

        <label className="block text-sm font-medium" htmlFor="github-token">
          Fine-Grained Personal Access Token
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="github-token"
            autoFocus
            autoComplete="off"
            spellCheck={false}
            type={visible ? 'text' : 'password'}
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="github_pat_…"
            className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-3 py-2.5 text-sm outline-none ring-rose/30 placeholder:text-mist/70 focus:ring-2 dark:border-white/10 dark:bg-night"
          />
          <button
            type="button"
            className="rounded-xl border border-line px-3 text-mist hover:text-ink dark:border-white/10 dark:hover:text-paper"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? 'Token verbergen' : 'Token anzeigen'}
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-mist dark:text-paper/65">
          Das Token bleibt nur in diesem Browser gespeichert. Es braucht Lese- und Schreibrecht auf Contents von{' '}
          <span className="font-medium text-ink dark:text-paper">
            {GITHUB_CONFIG.owner}/{GITHUB_CONFIG.repo}
          </span>
          .
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm text-mist hover:text-ink dark:hover:text-paper"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={!token.trim()}
            className="rounded-full bg-blood px-4 py-2 text-sm font-medium text-paper disabled:opacity-40"
          >
            Token speichern
          </button>
        </div>
      </form>
    </div>
  )
}
