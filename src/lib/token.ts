const TOKEN_KEY = 'mordoku-github-token'

export function readToken(): string | null {
  const value = localStorage.getItem(TOKEN_KEY)
  return value && value.trim() ? value : null
}

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token.trim())
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}
