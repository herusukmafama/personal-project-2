import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PreferencesProvider } from '../../i18n/PreferencesProvider'
import { SqlDeploymentTool } from './SqlDeploymentTool'

describe('SqlDeploymentTool', () => {
  it('renders native autocomplete metadata fields and drag-and-drop upload guidance', () => {
    const markup = renderToStaticMarkup(
      <PreferencesProvider>
        <SqlDeploymentTool />
      </PreferencesProvider>,
    )

    expect(markup).toContain('autoComplete="on"')
    expect(markup).toContain('name="deployment_feature"')
    expect(markup).toContain('name="deployment_database"')
    expect(markup).toContain('drag and drop')
    expect(markup).toContain('automatically be bundled into a ZIP')
    expect(markup).toContain('Accept all safe changes')
  })
})
