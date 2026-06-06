import { diffLines } from 'diff'
import { useMemo, useState } from 'react'
import type { ProposedFix, ReviewState } from './types'

type Props = {
  original: string
  proposed: string
  fixes: ProposedFix[]
  reviewState: ReviewState
  onAccept: () => void
  onReject: () => void
  onReset: () => void
}

export function DiffReview({ original, proposed, fixes, reviewState, onAccept, onReject, onReset }: Props) {
  const [view, setView] = useState<'unified' | 'side-by-side'>('unified')
  const changes = useMemo(() => diffLines(original, proposed), [original, proposed])
  const hasDestructiveFix = fixes.some(
    (fix) => fix.confidence === 'confirmation-required',
  )

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Review changes</h2>
            <p className="mt-1 text-xs text-slate-500">Approve the proposed SQL before it is used for download.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setView('unified')} className={view === 'unified' ? 'button-primary' : 'button-secondary'}>Unified</button>
            <button type="button" onClick={() => setView('side-by-side')} className={view === 'side-by-side' ? 'button-primary' : 'button-secondary'}>Side by side</button>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {fixes.map((fix) => (
            <div key={fix.code} className={`rounded-xl border px-4 py-3 text-sm ${fix.confidence === 'confirmation-required' ? 'border-red-200 bg-red-50 text-red-700' : 'border-brand-100 bg-brand-50 text-brand-700'}`}>
              <strong>{fix.title}</strong>
              <span className="ml-2">{fix.description}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={onAccept} className={hasDestructiveFix ? 'rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700' : 'button-primary'}>
            {hasDestructiveFix ? 'Accept destructive changes' : 'Accept proposed SQL'}
          </button>
          <button type="button" onClick={onReject} className="button-secondary">Keep original SQL</button>
          <button type="button" onClick={onReset} className="button-secondary">Reset decision</button>
          <span className="self-center text-xs font-medium uppercase tracking-wide text-slate-500">Status: {reviewState.replace('-', ' ')}</span>
        </div>
      </div>
      {view === 'unified' ? <UnifiedDiff changes={changes} /> : <SideBySide changes={changes} />}
    </section>
  )
}

function UnifiedDiff({ changes }: { changes: ReturnType<typeof diffLines> }) {
  return <pre className="max-h-[620px] overflow-auto bg-slate-950 p-5 text-xs leading-6 text-slate-200">{changes.map((part, index) => <span key={index} className={`block whitespace-pre-wrap ${part.added ? 'bg-emerald-950 text-emerald-200' : part.removed ? 'bg-red-950 text-red-200' : ''}`}>{part.value}</span>)}</pre>
}

function SideBySide({ changes }: { changes: ReturnType<typeof diffLines> }) {
  return (
    <div className="max-h-[620px] overflow-auto bg-slate-950">
      <div className="sticky top-0 z-10 grid grid-cols-2 bg-slate-900 text-xs font-semibold text-slate-400">
        <p className="border-r border-slate-700 px-5 py-2">Original</p>
        <p className="px-5 py-2">Proposed</p>
      </div>
      {changes.map((part, index) => (
        <div key={index} className="grid grid-cols-2 text-xs leading-6">
          <pre className={`min-w-0 whitespace-pre-wrap border-r border-slate-800 px-5 text-slate-200 ${part.removed ? 'bg-red-950 text-red-200' : ''}`}>
            {part.added ? '' : part.value}
          </pre>
          <pre className={`min-w-0 whitespace-pre-wrap px-5 text-slate-200 ${part.added ? 'bg-emerald-950 text-emerald-200' : ''}`}>
            {part.removed ? '' : part.value}
          </pre>
        </div>
      ))}
    </div>
  )
}
