import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { CloseIcon, FileCodeIcon, GridIcon, MenuIcon } from './Icons'

const navItems = [
  { label: 'Dashboard', to: '/', icon: GridIcon },
  { label: 'DOCX to JSON', to: '/tools/docx-to-json', icon: FileCodeIcon },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6">
        <div className="grid size-10 place-items-center rounded-xl bg-brand-600 text-lg font-bold text-white shadow-sm">
          P
        </div>
        <div>
          <p className="font-semibold text-slate-900">Personal Tools</p>
          <p className="text-xs text-slate-500">Simple tools, one place</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 p-4" aria-label="Main navigation">
        <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Workspace
        </p>
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`
            }
          >
            <Icon className="size-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="m-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold text-slate-700">Private by design</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Files stay in your browser and are never uploaded.
        </p>
      </div>
    </>
  )
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-72 flex-col bg-white shadow-xl">
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute right-3 top-3 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              onClick={() => setMobileOpen(false)}
            >
              <CloseIcon className="size-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8 lg:hidden">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <MenuIcon className="size-6" />
          </button>
          <span className="ml-3 font-semibold text-slate-900">Personal Tools</span>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 md:py-10 lg:px-10">
          <Outlet />
        </main>
        <footer className="border-t border-slate-200 bg-white/70 px-4 py-5 text-center text-xs text-slate-500 sm:px-6 lg:px-10">
          Built by Heru using the Codex App.
        </footer>
      </div>
    </div>
  )
}
