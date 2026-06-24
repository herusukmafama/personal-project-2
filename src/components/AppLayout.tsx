import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { usePreferences } from '../i18n/preferencesContext'
import type { Language, TranslationKey } from '../i18n/translations'
import { languageLabels } from '../i18n/translations'
import {
  BookIcon,
  CalculatorIcon,
  CompareIcon,
  CloseIcon,
  DatabaseIcon,
  FileCodeIcon,
  GridIcon,
  LayersIcon,
  MarkdownIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
} from './Icons'

const navItems: Array<{
  labelKey: TranslationKey
  to: string
  icon: typeof GridIcon
}> = [
  { labelKey: 'dashboard', to: '/', icon: GridIcon },
  { labelKey: 'docxToJson', to: '/tools/docx-to-json', icon: FileCodeIcon },
  { labelKey: 'docxToJsonV2', to: '/tools/docx-to-json-v2', icon: FileCodeIcon },
  { labelKey: 'compareText', to: '/tools/compare-text', icon: CompareIcon },
  { labelKey: 'markdownNotes', to: '/tools/markdown-notes', icon: MarkdownIcon },
  { labelKey: 'sqlDeployment', to: '/tools/sql-deployment-formatter', icon: DatabaseIcon },
  { labelKey: 'installmentSimulator', to: '/tools/installment-simulator', icon: CalculatorIcon },
  { labelKey: 'builtWith', to: '/built-with', icon: LayersIcon },
  { labelKey: 'changelog', to: '/changelog', icon: BookIcon },
]

const openToolsMarkUrl = `${import.meta.env.BASE_URL}brand/opentools-mark.png`

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { language, setLanguage, theme, toggleTheme, t } = usePreferences()
  const nextThemeLabel = theme === 'dark' ? t('switchToLight') : t('switchToDark')

  return (
    <>
      <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6 dark:border-slate-800">
        <img
          src={openToolsMarkUrl}
          alt="OpenTools logo"
          className="size-10 rounded-xl object-contain shadow-sm"
          width="40"
          height="40"
        />
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{t('appName')}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('appTagline')}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 p-4" aria-label="Main navigation">
        <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
          {t('workspace')}
        </p>
        {navItems.map(({ labelKey, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`
            }
          >
            <Icon className="size-5" />
            {t(labelKey)}
          </NavLink>
        ))}
      </nav>

      <div className="m-4 space-y-3">
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/80">
          <button
            type="button"
            aria-label={nextThemeLabel}
            onClick={toggleTheme}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
            {theme === 'dark' ? t('themeDark') : t('themeLight')}
          </button>
          <select
            aria-label={t('language')}
            value={language}
            onChange={(event) => setLanguage(event.target.value as Language)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-brand-500/30"
          >
            {Object.entries(languageLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{t('privateByDesign')}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {t('privateDescription')}
          </p>
        </div>
      </div>
    </>
  )
}

function MobileActions() {
  const { language, setLanguage, theme, toggleTheme, t } = usePreferences()
  const nextThemeLabel = theme === 'dark' ? t('switchToLight') : t('switchToDark')

  return (
    <div className="ml-auto flex items-center gap-2">
      <button
        type="button"
        aria-label={nextThemeLabel}
        onClick={toggleTheme}
        className="grid size-9 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        {theme === 'dark' ? <MoonIcon className="size-5" /> : <SunIcon className="size-5" />}
      </button>
      <select
        aria-label={t('language')}
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
      >
        {Object.entries(languageLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = usePreferences()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:flex">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label={t('closeNavigation')}
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm dark:bg-slate-950/70"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-72 flex-col bg-white shadow-xl dark:bg-slate-950">
            <button
              type="button"
              aria-label={t('closeNavigation')}
              className="absolute right-3 top-3 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={() => setMobileOpen(false)}
            >
              <CloseIcon className="size-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 md:px-8 lg:hidden">
          <button
            type="button"
            aria-label={t('openNavigation')}
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <MenuIcon className="size-6" />
          </button>
          <img
            src={openToolsMarkUrl}
            alt="OpenTools logo"
            className="ml-3 size-8 rounded-lg object-contain"
            width="32"
            height="32"
          />
          <span className="ml-2 font-semibold text-slate-900 dark:text-white">{t('appName')}</span>
          <MobileActions />
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 md:py-10 lg:px-10">
          <Outlet />
        </main>
        <footer className="border-t border-slate-200 bg-white/70 px-4 py-5 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400 sm:px-6 lg:px-10">
          {t('footer')}
        </footer>
      </div>
    </div>
  )
}
