import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { SqlDeploymentTool } from '../tools/sql-deployment/SqlDeploymentTool'

export function SqlDeploymentPage() {
  return (
    <div>
      <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-brand-600">
        <span aria-hidden="true">←</span>
        Back to dashboard
      </Link>
      <PageHeader
        eyebrow="Database deployment"
        title="Format Your SQL for SLRC Deployment"
        description="Prepare PostgreSQL files, deployment.txt, and an ordered ticket note using the database deployment guideline."
      />
      <SqlDeploymentTool />
    </div>
  )
}
