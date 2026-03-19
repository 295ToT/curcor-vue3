import { createI18n } from 'vue-i18n'
import zhCN from '../locales/zh-CN'
import enUS from '../locales/en-US'

export const LOCALE_STORAGE_KEY = 'student-admin:locale:v1'

export type AppLocale = 'zh-CN' | 'en-US'

function loadLocale(): AppLocale {
  const v = localStorage.getItem(LOCALE_STORAGE_KEY)
  return v === 'en-US' ? 'en-US' : 'zh-CN'
}

export const i18n = createI18n({
  legacy: false,
  locale: loadLocale(),
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

export function persistLocale(locale: AppLocale) {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale)
}
