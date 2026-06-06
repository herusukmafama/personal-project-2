import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DiffReview } from './DiffReview'

describe('DiffReview', () => {
  it('renders original, proposed, fix summary, and pending review state', () => {
    const markup = renderToStaticMarkup(
      <DiffReview
        original={'CREATE OR REPLACE VIEW public.v AS SELECT 1;\n'}
        proposed={
          'DROP VIEW IF EXISTS public.v;\n\nCREATE VIEW public.v AS SELECT 1;\n'
        }
        fixes={[
          {
            code: 'view-drop-create',
            title: 'Replace CREATE OR REPLACE VIEW',
            description: 'Add a matching DROP.',
            confidence: 'safe',
          },
        ]}
        reviewState="needs-review"
        onAccept={() => undefined}
        onReject={() => undefined}
        onReset={() => undefined}
      />,
    )
    expect(markup).toContain('Review changes')
    expect(markup).toContain('Replace CREATE OR REPLACE VIEW')
    expect(markup).toContain('DROP VIEW IF EXISTS public.v')
    expect(markup).toContain('Status: needs review')
  })
})
