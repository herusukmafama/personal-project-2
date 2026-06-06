import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { DocxToJsonTool } from '../tools/docx-to-json/DocxToJsonTool'

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

      <DocxToJsonTool />
    </div>
  )
}
