import { Link } from 'react-router-dom'
import { FileCodeIcon, ShieldIcon, UploadIcon } from '../components/Icons'
import { PageHeader } from '../components/PageHeader'

export function ConverterPage() {
  return (
    <div>
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-brand-600"
      >
        <span aria-hidden="true">←</span>
        Back to dashboard
      </Link>

      <PageHeader
        eyebrow="File converter"
        title="DOCX to JSON Converter"
        description="Convert Word documents into clean, structured JSON directly in your browser."
      />

      <section className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center sm:py-20">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <UploadIcon className="size-7" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-slate-900">Choose a DOCX file</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Drag and drop a Word document here, or browse your device to get started.
            </p>
            <button
              type="button"
              disabled
              title="File conversion will be added in the next phase"
              className="mt-6 cursor-not-allowed rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white opacity-60 shadow-sm"
            >
              Select file
            </button>
            <p className="mt-3 text-xs text-slate-400">Converter functionality coming soon</p>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldIcon className="size-5" />
            </div>
            <h2 className="mt-4 font-semibold text-slate-900">Your files stay private</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Conversion happens locally. Your documents never leave this browser.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <FileCodeIcon className="size-5" />
            </div>
            <h2 className="mt-4 font-semibold text-slate-900">What to expect</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              The completed tool will turn document content into readable, downloadable JSON.
            </p>
          </div>
        </aside>
      </section>
    </div>
  )
}
