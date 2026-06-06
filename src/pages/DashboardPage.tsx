import { Link } from 'react-router-dom'
import { ArrowIcon, FileCodeIcon, ShieldIcon } from '../components/Icons'
import { PageHeader } from '../components/PageHeader'

export function DashboardPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Your workspace"
        title="Useful tools, without the fuss."
        description="Quick, private utilities designed to make everyday file tasks simpler. Everything runs right in your browser."
      />

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Available tools</h2>
            <p className="mt-1 text-sm text-slate-500">Start with a tool below.</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
            1 tool
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Link
            to="/tools/docx-to-json"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <FileCodeIcon className="size-6" />
              </div>
              <ArrowIcon className="size-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-600" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-slate-900">DOCX to JSON</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Turn a Word document into structured JSON, ready to inspect and use.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs font-medium text-emerald-700">
              <ShieldIcon className="size-4" />
              Browser-only processing
            </div>
          </Link>

          <div className="flex min-h-60 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center">
            <div>
              <div className="mx-auto grid size-10 place-items-center rounded-full bg-slate-200/70 text-xl text-slate-500">
                +
              </div>
              <p className="mt-3 text-sm font-medium text-slate-600">More tools coming soon</p>
              <p className="mt-1 text-xs text-slate-400">This dashboard is ready to grow.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
