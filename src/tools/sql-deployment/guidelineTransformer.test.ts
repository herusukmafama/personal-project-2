import { describe, expect, it } from 'vitest'
import { validateDeployment } from './artifacts'
import { proposeGuidelineFixes } from './guidelineTransformer'
import { applyReviewDecision, updateReviewedOutputName } from './reviewState'
import type { SqlFileResult } from './types'

describe('guideline transformer', () => {
  it('replaces CREATE OR REPLACE FUNCTION and preserves its body', () => {
    const source = `-- preserved
CREATE OR REPLACE FUNCTION public.get_user(
  p_name varchar,
  p_amount numeric DEFAULT (10 + 5)
) RETURNS text AS $BODY$
BEGIN
  RETURN p_name || ';' || p_amount;
END;
$BODY$ LANGUAGE plpgsql;`
    const proposal = proposeGuidelineFixes(source)
    expect(proposal.proposedSql).toMatch(
      /DROP FUNCTION IF EXISTS public\.get_user\s*\(varchar, numeric\);/,
    )
    expect(proposal.proposedSql).toContain('CREATE FUNCTION public.get_user')
    expect(proposal.proposedSql).toContain("RETURN p_name || ';' || p_amount;")
    expect(proposal.proposedSql).toContain('-- preserved')
    expect(proposal.proposedSql.trimStart().startsWith('-- preserved')).toBe(true)
    expect(proposal.fixes).toHaveLength(1)
  })

  it('adds safe drops to plain functions, views, and triggers', () => {
    expect(
      proposeGuidelineFixes(
        'CREATE FUNCTION public.fn(p_value text) RETURNS text AS $$ BEGIN RETURN p_value; END; $$ LANGUAGE plpgsql;',
      ).proposedSql,
    ).toMatch(/DROP FUNCTION IF EXISTS public\.fn\s*\(text\);/)
    expect(
      proposeGuidelineFixes('CREATE VIEW public.v_users AS SELECT 1;').proposedSql,
    ).toContain('DROP VIEW IF EXISTS public.v_users;')
    expect(
      proposeGuidelineFixes(
        'CREATE TRIGGER trg_users BEFORE INSERT ON public.users EXECUTE FUNCTION public.fn();',
      ).proposedSql,
    ).toContain('DROP TRIGGER IF EXISTS trg_users ON public.users;')
  })

  it('adds safe existence guards for schema and columns', () => {
    expect(proposeGuidelineFixes('CREATE SCHEMA testing;').proposedSql).toContain(
      'CREATE SCHEMA IF NOT EXISTS testing;',
    )
    expect(
      proposeGuidelineFixes(
        'ALTER TABLE public.users ADD COLUMN name text;',
      ).proposedSql,
    ).toContain('ADD COLUMN IF NOT EXISTS name text')
  })

  it('marks table and materialized-view drops as confirmation required', () => {
    const table = proposeGuidelineFixes(
      'CREATE TABLE IF NOT EXISTS public.users (id bigint);',
    )
    const view = proposeGuidelineFixes(
      'CREATE MATERIALIZED VIEW public.mv_users AS SELECT 1;',
    )
    expect(table.proposedSql).toContain('DROP TABLE IF EXISTS public.users;')
    expect(table.fixes[0].confidence).toBe('confirmation-required')
    expect(view.proposedSql).toContain(
      'DROP MATERIALIZED VIEW IF EXISTS public.mv_users;',
    )
    expect(view.fixes[0].confidence).toBe('confirmation-required')
  })

  it('does not rewrite unsupported hardcoded INSERT values', () => {
    const source = 'INSERT INTO public.users (user_id, name) VALUES (1, \'Heru\');'
    const proposal = proposeGuidelineFixes(source)
    expect(proposal.proposedSql).toBe(source)
    expect(proposal.fixes).toEqual([])
  })

  it('does not duplicate an existing DROP statement', () => {
    const source =
      'DROP VIEW IF EXISTS public.v_users;\n\nCREATE VIEW public.v_users AS SELECT 1;'
    const proposal = proposeGuidelineFixes(source)
    expect(proposal.fixes).toEqual([])
    expect(proposal.proposedSql).toBe(source)
  })

  it('does not duplicate an existing DROP when replacing CREATE OR REPLACE', () => {
    const source =
      'DROP VIEW IF EXISTS public.v_users;\n\nCREATE OR REPLACE VIEW public.v_users AS SELECT 1;'
    const proposal = proposeGuidelineFixes(source)
    expect(
      proposal.proposedSql.match(/DROP VIEW IF EXISTS public\.v_users/gi),
    ).toHaveLength(1)
    expect(proposal.proposedSql).not.toContain('CREATE OR REPLACE')
  })
})

describe('review gate', () => {
  it('blocks deployment while a proposal needs review', () => {
    const file = fixture('needs-review')
    expect(
      validateDeployment(
        { environment: 'SIT', feature: '123_feature', database: 'idc' },
        [file],
      ).map((finding) => finding.code),
    ).toContain(`pending-review-${file.id}`)
  })

  it.each(['accepted', 'rejected', 'no-changes'] as const)(
    'allows a valid %s revision through the review gate',
    (reviewState) => {
      const findings = validateDeployment(
        { environment: 'SIT', feature: '123_feature', database: 'idc' },
        [fixture(reviewState)],
      )
      expect(findings).toEqual([])
    },
  )

  it('accepts proposed SQL and rejects back to formatted original SQL', () => {
    const pending = fixture('needs-review')
    const accepted = applyReviewDecision(pending, 'accepted')
    const rejected = applyReviewDecision(accepted, 'rejected')
    expect(accepted.acceptedSql).toBe(pending.proposedSql)
    expect(accepted.reviewState).toBe('accepted')
    expect(rejected.acceptedSql).toBe(pending.formattedOriginalSql)
    expect(rejected.reviewState).toBe('rejected')
  })

  it('revalidates filename warnings after a filename edit', () => {
    const file = fixture('no-changes')
    file.findings = [
      {
        code: 'filename-mismatch',
        severity: 'warning',
        message: 'Mismatch',
      },
    ]
    expect(
      updateReviewedOutputName(file, '6_idc_public_fn_P1_CRFUN.sql').findings,
    ).not.toContainEqual(expect.objectContaining({ code: 'filename-mismatch' }))
  })
})

function fixture(reviewState: SqlFileResult['reviewState']): SqlFileResult {
  return {
    id: 'file-1',
    originalName: 'function.sql',
    outputName: '6_idc_public_fn_P1_CRFUN.sql',
    originalSql: 'CREATE FUNCTION public.fn(value text) RETURNS text;',
    formattedOriginalSql: 'CREATE FUNCTION public.fn(value text) RETURNS text;\n',
    proposedSql:
      'DROP FUNCTION IF EXISTS public.fn(text);\n\nCREATE FUNCTION public.fn(value text) RETURNS text;\n',
    acceptedSql:
      reviewState === 'accepted'
        ? 'DROP FUNCTION IF EXISTS public.fn(text);\n\nCREATE FUNCTION public.fn(value text) RETURNS text;\n'
        : 'CREATE FUNCTION public.fn(value text) RETURNS text;\n',
    proposedFixes: [],
    reviewState,
    analysis: {
      sequence: '6',
      schema: 'public',
      objectName: 'fn',
      operationCode: 'CRFUN',
      parameterCount: 1,
      statementCount: 1,
    },
    findings: [],
  }
}
