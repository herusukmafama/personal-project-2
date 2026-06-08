import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { PreferencesProvider } from './i18n/PreferencesProvider'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <PreferencesProvider>
        <App />
      </PreferencesProvider>
    </HashRouter>
  </StrictMode>,
)
