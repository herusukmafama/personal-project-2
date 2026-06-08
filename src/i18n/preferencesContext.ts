import { createContext, useContext } from 'react'
import type { TranslationKey, Language } from './translations'

export type Theme = 'light' | 'dark'

export type PreferencesContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  theme: Theme
  toggleTheme: () => void
  t: (key: TranslationKey) => string
}

export const LANGUAGE_KEY = 'personal_tools_language'
export const THEME_KEY = 'personal_tools_theme'

export const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider')
  }
  return context
}
