import { defineStore } from 'pinia'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'student-admin:ui:v2'

function safeParse(json: string | null): unknown {
  if (!json) return null
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

function loadTheme(): Theme {
  const parsed = safeParse(localStorage.getItem(STORAGE_KEY))
  if (parsed === 'light' || parsed === 'dark') return parsed
  // 默认跟随系统：如果系统暗色则 dark，否则 light
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function saveTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(theme))
}

export const useUiStore = defineStore('ui', {
  state: () => ({
    theme: loadTheme() as Theme,
  }),
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      saveTheme(this.theme)
    },
  },
})

