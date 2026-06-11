import { describe, expect, it } from 'vitest'
import { generateArtifacts, isValidOutputName, validateDeployment } from './artifacts'
import { acceptAllSafeChanges } from './bulkReview'
import { createDeploymentZip } from './downloadArtifacts'
import JSZip from 'jszip'
import { sortFilesByDeploymentOrder } from './deploymentOrder'
import { processSqlFiles } from './processSqlFiles'
import { analyzeSql, buildOutputName, splitTopLevelStatements, validateSql } from './sqlAnalyzer'
import { formatPostgresqlSql } from './sqlFormatter'
import type { DeploymentMetadata, SqlFileResult } from './types'

const metadata: DeploymentMetadata = {
  environment: 'SIT',
  feature: '7438_tasklist_spv_headops',
  database: 'idc-collection-v2',
}

describe('SQL deployment analyzer', () => {
  it.each([
    ['CREATE SCHEMA IF NOT EXISTS testing;', '1', 'testing', 'CRSCM'],
    ['CREATE TABLE public.users (id bigint);', '2', 'users', 'CRTBL'],
    ['ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name text;', '3', 'users', 'ALTBL'],
    ['CREATE VIEW public.v_users AS SELECT 1;', '4', 'v_users', 'CRVW'],
    ['INSERT INTO public.users (name) VALUES (\'Heru\');', '5', 'users', 'INSTBL'],
    ['UPDATE public.users SET name = \'Heru\';', '5', 'users', 'UPTBL'],
    ['DELETE FROM public.users WHERE id = 1;', '5', 'users', 'DLTBL'],
    ['CREATE TRIGGER trg_users BEFORE INSERT ON public.users EXECUTE FUNCTION public.fn();', '7', 'trg_users', 'CRTGR'],
  ])('infers guideline identity for %s', (sql, sequence, objectName, operationCode) => {
    expect(analyzeSql(sql)).toMatchObject({ sequence, objectName, operationCode })
  })

  it('counts function parameters and keeps dollar-quoted body as one statement', () => {
    const sql = `DROP FUNCTION IF EXISTS public.get_user(varchar, numeric);
CREATE FUNCTION public.get_user(p_name varchar, p_amount numeric DEFAULT 0)
RETURNS text AS $BODY$
BEGIN
  RETURN p_name || ';' || p_amount;
END;
$BODY$ LANGUAGE plpgsql;`
    const analysis = analyzeSql(sql)
    expect(analysis).toMatchObject({
      sequence: '6',
      schema: 'public',
      objectName: 'get_user',
      operationCode: 'CRFUN',
      parameterCount: 2,
      statementCount: 2,
    })
    expect(splitTopLevelStatements(sql)).toHaveLength(2)
    expect(buildOutputName(analysis, metadata)).toBe(
      '6_idc-collection-v2_public_get_user_P2_CRFUN.sql',
    )
  })

  it('counts function parameters containing nested default expressions', () => {
    const analysis = analyzeSql(`
      CREATE FUNCTION public.test(
        p_name varchar DEFAULT concat('a', 'b'),
        p_amount numeric DEFAULT (10 + 5)
      ) RETURNS text AS $$ BEGIN RETURN p_name; END; $$ LANGUAGE plpgsql;
    `)
    expect(analysis.parameterCount).toBe(2)
  })

  it('infers trigger schema from its target table', () => {
    expect(
      analyzeSql(
        'CREATE TRIGGER trg_users BEFORE INSERT ON public.users EXECUTE FUNCTION public.fn();',
      ),
    ).toMatchObject({ sequence: '7', schema: 'public', objectName: 'trg_users', operationCode: 'CRTGR' })
  })

  it('formats without removing comments or dollar-quoted function content', () => {
    const sql = `-- keep me
CREATE FUNCTION public.test() RETURNS text AS $$
BEGIN
RETURN 'Hello; world';
END;
$$ LANGUAGE plpgsql;`
    const formatted = formatPostgresqlSql(sql)
    expect(formatted).toContain('-- keep me')
    expect(formatted).toContain("'Hello; world'")
    expect(formatted).toContain('$$')
  })

  it('reports structural warnings without rewriting them', () => {
    const sql = 'CREATE OR REPLACE VIEW public.v_users AS SELECT 1;'
    const analysis = analyzeSql(sql)
    const findings = validateSql(sql, 'view.sql', analysis)
    expect(findings.some((item) => item.code === 'create-or-replace')).toBe(true)
    expect(findings.some((item) => item.code === 'missing-drop')).toBe(true)
    expect(formatPostgresqlSql(sql)).toContain('CREATE OR REPLACE VIEW')
  })
})

describe('deployment artifacts', () => {
  const files = [
    file('2_db_public_users_CRTBL.sql'),
    file('6_db_public_get_user_P1_CRFUN.sql'),
  ]

  it('generates ordered deployment.txt and SLRC ticket note', () => {
    const artifacts = generateArtifacts(metadata, files)
    expect(artifacts.deploymentText).toBe(
      'env=SIT\nfeature=7438_tasklist_spv_headops\n\n2_db_public_users_CRTBL.sql\n6_db_public_get_user_P1_CRFUN.sql\n',
    )
    expect(artifacts.ticketNote).toContain('Dear Mas @idc_hardy,')
    expect(artifacts.ticketNote).toContain('Mohon bantuan deployment untuk fixing SPLC 7438 Tasklist SPV HeadOps.')
    expect(artifacts.ticketNote).toContain('Database: idc-collection-v2')
    expect(artifacts.ticketNote).toContain('Feature/Branch: 7438_tasklist_spv_headops')
    expect(artifacts.ticketNote).toContain('List file SQL sesuai urutan deployment:')
    expect(artifacts.ticketNote).toContain('1. 2_db_public_users_CRTBL.sql')
    expect(artifacts.ticketNote).toContain('deployment.txt sudah disesuaikan')
  })

  it('blocks duplicate names and missing metadata', () => {
    const findings = validateDeployment(
      { environment: 'SIT', feature: '', database: '' },
      [file('same.sql'), file('same.sql')],
    )
    expect(findings.map((item) => item.code)).toEqual(
      expect.arrayContaining(['missing-feature', 'missing-database', 'duplicate-names']),
    )
  })

  it('allows users to resolve inference gaps with a valid edited filename', () => {
    expect(isValidOutputName('7_idc_public_trg_users_CRTGR.sql')).toBe(true)
    expect(isValidOutputName('6_idc_public_get_user_P2_CRFUN.sql')).toBe(true)
    expect(isValidOutputName('public_get_user.sql')).toBe(false)
  })

  it('builds a multi-file ZIP containing SQL files and deployment.txt', async () => {
    const artifacts = generateArtifacts(metadata, files)
    const zip = await JSZip.loadAsync(await createDeploymentZip(files, artifacts))
    expect(Object.keys(zip.files).sort()).toEqual(
      [
        '2_db_public_users_CRTBL.sql',
        '6_db_public_get_user_P1_CRFUN.sql',
        'deployment.txt',
      ].sort(),
    )
    expect(await zip.file('deployment.txt')?.async('string')).toBe(artifacts.deploymentText)
    expect(
      await zip.file('2_db_public_users_CRTBL.sql')?.async('string'),
    ).toBe(files[0].acceptedSql)
  })

  it('sorts deployment files ascending by numeric filename sequence', () => {
    expect(
      sortFilesByDeploymentOrder([
        file('10_db_public_late_CRTBL.sql'),
        file('2_db_public_users_CRTBL.sql'),
        file('6_db_public_get_user_P1_CRFUN.sql'),
      ]).map((item) => item.outputName),
    ).toEqual([
      '2_db_public_users_CRTBL.sql',
      '6_db_public_get_user_P1_CRFUN.sql',
      '10_db_public_late_CRTBL.sql',
    ])
  })

  it('bulk accepts safe proposals and skips destructive or mixed proposals', () => {
    const safeOne = reviewFile('safe-one.sql', ['safe'])
    const safeTwo = reviewFile('safe-two.sql', ['safe'])
    const destructive = reviewFile('destructive.sql', ['confirmation-required'])
    const mixed = reviewFile('mixed.sql', ['safe', 'confirmation-required'])

    const result = acceptAllSafeChanges([safeOne, safeTwo, destructive, mixed])

    expect(result.acceptedCount).toBe(2)
    expect(result.skippedCount).toBe(2)
    expect(result.files[0]).toMatchObject({
      reviewState: 'accepted',
      acceptedSql: safeOne.proposedSql,
    })
    expect(result.files[1]).toMatchObject({
      reviewState: 'accepted',
      acceptedSql: safeTwo.proposedSql,
    })
    expect(result.files[2].reviewState).toBe('needs-review')
    expect(result.files[3].reviewState).toBe('needs-review')
  })

  it('processes multiple SQL files and reports unsupported dropped files', async () => {
    const result = await processSqlFiles(
      [
        new File(['CREATE VIEW public.first_view AS SELECT 1;'], 'first.sql'),
        new File(['CREATE VIEW public.second_view AS SELECT 1;'], 'second.sql'),
        new File(['not sql'], 'notes.txt'),
      ],
      metadata,
      {
        onlySqlSupported: 'Only .sql files are supported.',
        sqlAnalysisFailed: 'SQL analysis failed.',
      },
    )

    expect(result).toHaveLength(3)
    expect(result[0].originalName).toBe('first.sql')
    expect(result[1].originalName).toBe('second.sql')
    expect(result[2].findings).toEqual([
      {
        code: 'processing-failed',
        severity: 'error',
        message: 'Only .sql files are supported.',
      },
    ])
  })
})

function file(outputName: string): SqlFileResult {
  return {
    id: outputName,
    originalName: outputName,
    outputName,
    originalSql: 'SELECT 1;',
    formattedOriginalSql: 'SELECT 1;\n',
    proposedSql: 'SELECT 1;\n',
    acceptedSql: 'SELECT 1;\n',
    proposedFixes: [],
    reviewState: 'no-changes',
    analysis: {
      sequence: '2',
      schema: 'public',
      objectName: 'users',
      operationCode: 'CRTBL',
      statementCount: 1,
    },
    findings: [],
  }
}

function reviewFile(
  id: string,
  confidence: Array<'safe' | 'confirmation-required'>,
): SqlFileResult {
  const outputName = '4_db_public_sample_CRVW.sql'
  return {
    ...file(outputName),
    id,
    originalName: id,
    formattedOriginalSql: 'CREATE VIEW public.sample AS SELECT 1;\n',
    proposedSql: 'DROP VIEW IF EXISTS public.sample;\nCREATE VIEW public.sample AS SELECT 1;\n',
    acceptedSql: 'CREATE VIEW public.sample AS SELECT 1;\n',
    reviewState: 'needs-review',
    proposedFixes: confidence.map((item, index) => ({
      code: `${id}-${index}`,
      title: 'Proposed fix',
      description: 'Review this change.',
      confidence: item,
    })),
  }
}
