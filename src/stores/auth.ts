import { defineStore } from 'pinia'

export type User = {
  username: string
}

const STORAGE_KEY = 'student-admin:auth:v1'

function safeParse(json: string | null): unknown {
  if (!json) return null
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

function loadUser(): User | null {
  const v = safeParse(localStorage.getItem(STORAGE_KEY))
  if (!v || typeof v !== 'object') return null
  const u = v as Record<string, unknown>
  return typeof u.username === 'string' && u.username ? { username: u.username } : null
}

function saveUser(user: User | null) {
  if (!user) localStorage.removeItem(STORAGE_KEY)
  else localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: loadUser() as User | null,
  }),
  getters: {
    isAuthed: (state) => Boolean(state.user),
  },
  actions: {
    login(username: string, password: string) {
      const u = username.trim()
      const p = password
      if (!u || !p) return false

      // demo auth: admin / 123456
      if (u === 'admin' && p === '123456') {
        this.user = { username: u }
        saveUser(this.user)
        return true
      }
      return false
    },
    logout() {
      this.user = null
      saveUser(null)
    },
  },
})

