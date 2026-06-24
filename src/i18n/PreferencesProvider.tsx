import {
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  type Language,
  translations,
} from './translations'
import {
  LANGUAGE_KEY,
  PreferencesContext,
  type PreferencesContextValue,
  THEME_KEY,
  type Theme,
} from './preferencesContext'

function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  const stored = window.localStorage.getItem(LANGUAGE_KEY)
  return stored === 'en' || stored === 'id' ? stored : 'en'
}

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(THEME_KEY)
  return stored === 'dark' || stored === 'light' ? stored : getSystemTheme()
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage)
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [hasStoredTheme, setHasStoredTheme] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(THEME_KEY) === 'dark' || window.localStorage.getItem(THEME_KEY) === 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    if (hasStoredTheme || typeof window === 'undefined') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => setTheme(media.matches ? 'dark' : 'light')
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [hasStoredTheme])

  function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage)
    window.localStorage.setItem(LANGUAGE_KEY, nextLanguage)
  }

  function toggleTheme() {
    setTheme((current) => {
      const nextTheme = current === 'dark' ? 'light' : 'dark'
      window.localStorage.setItem(THEME_KEY, nextTheme)
      setHasStoredTheme(true)
      return nextTheme
    })
  }

  const value = useMemo<PreferencesContextValue>(
    () => ({
      language,
      setLanguage,
      theme,
      toggleTheme,
      t: (key) => translations[language][key],
    }),
    [language, theme],
  )

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}
