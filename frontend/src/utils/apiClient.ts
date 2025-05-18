const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function apiClient(path: string, opts: RequestInit = {}) {
  return fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts
  })
}
