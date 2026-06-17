import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { BuiltWithPage } from './pages/BuiltWithPage'
import { ChangelogPage } from './pages/ChangelogPage'
import { CompareTextPage } from './pages/CompareTextPage'
import { ConverterPage } from './pages/ConverterPage'
import { ConverterV2Page } from './pages/ConverterV2Page'
import { DashboardPage } from './pages/DashboardPage'
import { InstallmentSimulatorPage } from './pages/InstallmentSimulatorPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SqlDeploymentPage } from './pages/SqlDeploymentPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="tools/docx-to-json" element={<ConverterPage />} />
        <Route path="tools/docx-to-json-v2" element={<ConverterV2Page />} />
        <Route path="tools/compare-text" element={<CompareTextPage />} />
        <Route path="tools/sql-deployment-formatter" element={<SqlDeploymentPage />} />
        <Route path="tools/installment-simulator" element={<InstallmentSimulatorPage />} />
        <Route path="built-with" element={<BuiltWithPage />} />
        <Route path="changelog" element={<ChangelogPage />} />
        <Route path="dashboard" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
