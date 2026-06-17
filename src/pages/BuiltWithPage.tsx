import type { ReactNode } from 'react'
import { PageHeader } from '../components/PageHeader'
import { usePreferences } from '../i18n/preferencesContext'
import type { Language } from '../i18n/translations'

type Technology = {
  name: string
  category: string
  description: Record<Language, string>
  icon: ReactNode
  accent: string
}

const technologies: Technology[] = [
  {
    name: 'React 19',
    category: 'Frontend Foundation',
    description: {
      id: 'Library UI berbasis komponen untuk membangun halaman, layout, dan tools interaktif di portal.',
      en: 'Component-based UI library used to build the portal pages, layouts, and interactive tools.',
    },
    icon: <ReactLogo />,
    accent: 'bg-cyan-50 text-cyan-700 ring-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-200 dark:ring-cyan-500/20',
  },
  {
    name: 'TypeScript',
    category: 'Frontend Foundation',
    description: {
      id: 'Menambahkan type safety untuk kalkulasi, parsing, validasi, dan kontrak UI yang reusable.',
      en: 'Adds type safety for calculations, parsing, validation, and reusable UI contracts.',
    },
    icon: <TypeScriptLogo />,
    accent: 'bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-200 dark:ring-blue-500/20',
  },
  {
    name: 'Vite 7',
    category: 'Frontend Foundation',
    description: {
      id: 'Development server cepat dan build tool production untuk aplikasi React.',
      en: 'Fast development server and production build tool for the React application.',
    },
    icon: <ViteLogo />,
    accent: 'bg-violet-50 text-violet-700 ring-violet-100 dark:bg-violet-500/10 dark:text-violet-200 dark:ring-violet-500/20',
  },
  {
    name: 'Tailwind CSS 4',
    category: 'Frontend Foundation',
    description: {
      id: 'Sistem styling utility-first untuk card responsif, dashboard, serta mode gelap dan terang.',
      en: 'Utility-first styling system for responsive cards, dashboards, and dark/light mode.',
    },
    icon: <TailwindLogo />,
    accent: 'bg-sky-50 text-sky-700 ring-sky-100 dark:bg-sky-500/10 dark:text-sky-200 dark:ring-sky-500/20',
  },
  {
    name: 'React Router',
    category: 'Frontend Foundation',
    description: {
      id: 'Routing di sisi browser untuk dashboard, tools, changelog, dan halaman portfolio.',
      en: 'Client-side routing for dashboard, tools, changelog, and portfolio pages.',
    },
    icon: <RouterLogo />,
    accent: 'bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-500/20',
  },
  {
    name: 'Mammoth.js',
    category: 'Document Processing',
    description: {
      id: 'Membaca konten DOCX langsung di browser untuk fitur DOCX to JSON.',
      en: 'Reads DOCX content directly in the browser for the DOCX to JSON converter.',
    },
    icon: <LetterLogo label="M" />,
    accent: 'bg-orange-50 text-orange-700 ring-orange-100 dark:bg-orange-500/10 dark:text-orange-200 dark:ring-orange-500/20',
  },
  {
    name: 'JSZip',
    category: 'Document Processing',
    description: {
      id: 'Membuat ZIP langsung di browser untuk output deployment SQL dengan banyak file.',
      en: 'Creates browser-generated ZIP bundles for multi-file SQL deployment output.',
    },
    icon: <LetterLogo label="ZIP" />,
    accent: 'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/20',
  },
  {
    name: 'sql-formatter',
    category: 'Developer Productivity',
    description: {
      id: 'Merapikan script PostgreSQL tanpa sengaja mengubah perilaku SQL.',
      en: 'Formats PostgreSQL scripts while keeping the SQL behavior intact.',
    },
    icon: <LetterLogo label="SQL" />,
    accent: 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/20',
  },
  {
    name: 'diff',
    category: 'Developer Productivity',
    description: {
      id: 'Menampilkan review SQL serta Compare Text dalam tampilan side-by-side dan unified.',
      en: 'Powers SQL review and Compare Text through side-by-side and unified diff views.',
    },
    icon: <DiffLogo />,
    accent: 'bg-indigo-50 text-indigo-700 ring-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-200 dark:ring-indigo-500/20',
  },
  {
    name: 'Vitest',
    category: 'Quality & Testing',
    description: {
      id: 'Menjalankan automated test untuk kalkulator, parser, mapper, dan generator artifact.',
      en: 'Runs fast automated tests for calculators, parsers, mappers, and artifact generators.',
    },
    icon: <VitestLogo />,
    accent: 'bg-lime-50 text-lime-700 ring-lime-100 dark:bg-lime-500/10 dark:text-lime-200 dark:ring-lime-500/20',
  },
  {
    name: 'ESLint',
    category: 'Quality & Testing',
    description: {
      id: 'Menjaga kualitas kode tetap konsisten dan mendeteksi pola berisiko saat development.',
      en: 'Keeps code quality consistent and catches risky patterns during development.',
    },
    icon: <EslintLogo />,
    accent: 'bg-purple-50 text-purple-700 ring-purple-100 dark:bg-purple-500/10 dark:text-purple-200 dark:ring-purple-500/20',
  },
  {
    name: 'GitHub Actions',
    category: 'DevOps & Deployment',
    description: {
      id: 'Melakukan build dan deploy portal ke GitHub Pages secara otomatis dari branch main.',
      en: 'Builds and deploys the portal automatically to GitHub Pages from the main branch.',
    },
    icon: <GitHubActionsLogo />,
    accent: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700',
  },
]

const categories = Array.from(new Set(technologies.map((technology) => technology.category)))

export function BuiltWithPage() {
  const { language, t } = usePreferences()

  return (
    <div>
      <PageHeader
        eyebrow={t('builtWithEyebrow')}
        title={t('builtWithTitle')}
        description={t('builtWithDescription')}
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {categories.map((category) => {
          const count = technologies.filter((technology) => technology.category === category).length
          return (
            <article
              key={category}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
                {count} {count === 1 ? 'tool' : 'tools'}
              </p>
              <h2 className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                {category}
              </h2>
            </article>
          )
        })}
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {technologies.map((technology) => (
          <article
            key={technology.name}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-brand-500/40"
          >
            <div className="flex items-start justify-between gap-4">
              <div className={`grid size-14 shrink-0 place-items-center rounded-2xl ring-1 ${technology.accent}`}>
                {technology.icon}
              </div>
              <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-400 dark:ring-slate-800">
                {technology.category}
              </span>
            </div>
            <h2 className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">
              {technology.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">
              {technology.description[language]}
            </p>
          </article>
        ))}
      </section>
    </div>
  )
}

function ReactLogo() {
  return (
    <svg viewBox="0 0 64 64" className="size-8" aria-hidden="true">
      <circle cx="32" cy="32" r="4.5" fill="currentColor" />
      <ellipse cx="32" cy="32" rx="26" ry="10" fill="none" stroke="currentColor" strokeWidth="4" />
      <ellipse cx="32" cy="32" rx="26" ry="10" fill="none" stroke="currentColor" strokeWidth="4" transform="rotate(60 32 32)" />
      <ellipse cx="32" cy="32" rx="26" ry="10" fill="none" stroke="currentColor" strokeWidth="4" transform="rotate(120 32 32)" />
    </svg>
  )
}

function TypeScriptLogo() {
  return (
    <svg viewBox="0 0 64 64" className="size-8" aria-hidden="true">
      <rect width="56" height="56" x="4" y="4" rx="8" fill="currentColor" opacity="0.16" />
      <path fill="currentColor" d="M15 25h22v5h-8v21h-6V30h-8v-5Zm25 25v-6c2 2 4.5 3 7 3 2 0 3.2-.7 3.2-2 0-.8-.4-1.4-1.3-1.8-.8-.5-2.2-1-4-1.7-4.2-1.5-6.3-4-6.3-7.4 0-3 1.1-5.3 3.4-7 2.1-1.6 4.9-2.4 8.2-2.4 2.6 0 4.8.4 6.6 1.2v5.6c-1.8-1.1-3.9-1.7-6.2-1.7-1.8 0-3 .7-3 2 0 .8.4 1.3 1.1 1.8.8.4 2.1.9 4 1.6 4.4 1.6 6.6 4.1 6.6 7.6 0 3-1.1 5.4-3.4 7-2.2 1.5-5 2.3-8.6 2.3-3.1 0-5.6-.6-7.3-1.6Z" />
    </svg>
  )
}

function ViteLogo() {
  return (
    <svg viewBox="0 0 64 64" className="size-8" aria-hidden="true">
      <path fill="currentColor" d="M9 10 32 54 55 10 38 14 32 26 26 14 9 10Z" opacity="0.22" />
      <path fill="currentColor" d="m34 7-16 29h12l-3 20 18-31H33l1-18Z" />
    </svg>
  )
}

function TailwindLogo() {
  return (
    <svg viewBox="0 0 64 64" className="size-8" aria-hidden="true">
      <path fill="currentColor" d="M18 27c4-10 12-15 24-15 8 0 13 3 16 8-4-2-8-2-12 0-4 2-6 6-10 8-6 3-12 1-18-1Zm-12 16c4-10 12-15 24-15 8 0 13 3 16 8-4-2-8-2-12 0-4 2-6 6-10 8-6 3-12 1-18-1Z" />
    </svg>
  )
}

function RouterLogo() {
  return (
    <svg viewBox="0 0 64 64" className="size-8" aria-hidden="true">
      <circle cx="16" cy="32" r="8" fill="currentColor" />
      <circle cx="48" cy="16" r="8" fill="currentColor" opacity="0.75" />
      <circle cx="48" cy="48" r="8" fill="currentColor" opacity="0.75" />
      <path d="M24 32h8c8 0 8-16 16-16M24 32h8c8 0 8 16 16 16" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

function DiffLogo() {
  return (
    <svg viewBox="0 0 64 64" className="size-8" aria-hidden="true">
      <path d="M16 20h32M16 32h22M16 44h32" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M48 27v10M43 32h10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

function VitestLogo() {
  return (
    <svg viewBox="0 0 64 64" className="size-8" aria-hidden="true">
      <path fill="currentColor" d="M12 12h40L34 54h-4L12 12Z" opacity="0.2" />
      <path fill="currentColor" d="M20 16h8l6 22 9-22h7L36 50h-7L20 16Z" />
    </svg>
  )
}

function EslintLogo() {
  return (
    <svg viewBox="0 0 64 64" className="size-8" aria-hidden="true">
      <path fill="currentColor" d="M32 5 56 19v26L32 59 8 45V19L32 5Z" opacity="0.2" />
      <path fill="currentColor" d="M32 13 49 23v18L32 51 15 41V23l17-10Zm0 8-10 6v10l10 6 10-6V27l-10-6Z" />
    </svg>
  )
}

function GitHubActionsLogo() {
  return (
    <svg viewBox="0 0 64 64" className="size-8" aria-hidden="true">
      <path fill="currentColor" d="M14 12h20a8 8 0 0 1 8 8v4h8l-12 12-12-12h8v-4H14v24h16v8H14a8 8 0 0 1-8-8V20a8 8 0 0 1 8-8Zm26 28h16v8H40v-8Z" />
    </svg>
  )
}

function LetterLogo({ label }: { label: string }) {
  return (
    <span className="text-sm font-black tracking-tight" aria-hidden="true">
      {label}
    </span>
  )
}
