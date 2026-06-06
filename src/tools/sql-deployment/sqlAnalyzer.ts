import type {
  DeploymentMetadata,
  SqlAnalysis,
  ValidationFinding,
} from './types'

type OperationRule = {
  pattern: RegExp
  sequence: string
  operationCode: string
  kind: string
}

const OPERATION_RULES: OperationRule[] = [
  { pattern: /\bCREATE\s+(?:OR\s+REPLACE\s+)?SCHEMA\b/i, sequence: '1', operationCode: 'CRSCM', kind: 'SCHEMA' },
  { pattern: /\bDROP\s+SCHEMA\b/i, sequence: '1', operationCode: 'DRSCM', kind: 'SCHEMA' },
  { pattern: /\bCREATE\s+TABLE\b/i, sequence: '2', operationCode: 'CRTBL', kind: 'TABLE' },
  { pattern: /\bDROP\s+TABLE\b/i, sequence: '2', operationCode: 'DRTBL', kind: 'TABLE' },
  { pattern: /\bALTER\s+TABLE\b/i, sequence: '3', operationCode: 'ALTBL', kind: 'TABLE' },
  { pattern: /\bCREATE\s+(?:OR\s+REPLACE\s+)?(?:MATERIALIZED\s+)?VIEW\b/i, sequence: '4', operationCode: 'CRVW', kind: 'VIEW' },
  { pattern: /\bDROP\s+(?:MATERIALIZED\s+)?VIEW\b/i, sequence: '4', operationCode: 'DRVW', kind: 'VIEW' },
  { pattern: /\bINSERT\s+INTO\b/i, sequence: '5', operationCode: 'INSTBL', kind: 'INSERT' },
  { pattern: /\bUPDATE\b/i, sequence: '5', operationCode: 'UPTBL', kind: 'UPDATE' },
  { pattern: /\bDELETE\s+FROM\b/i, sequence: '5', operationCode: 'DLTBL', kind: 'DELETE' },
  { pattern: /\bCREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\b/i, sequence: '6', operationCode: 'CRFUN', kind: 'FUNCTION' },
  { pattern: /\bDROP\s+FUNCTION\b/i, sequence: '6', operationCode: 'DRFUN', kind: 'FUNCTION' },
  { pattern: /\bCREATE\s+TRIGGER\b/i, sequence: '7', operationCode: 'CRTGR', kind: 'TRIGGER' },
  { pattern: /\bDROP\s+TRIGGER\b/i, sequence: '7', operationCode: 'DRTGR', kind: 'TRIGGER' },
  { pattern: /\bCREATE\s+(?:UNIQUE\s+)?INDEX\b/i, sequence: '', operationCode: 'CRIDX', kind: 'INDEX' },
  { pattern: /\bDROP\s+INDEX\b/i, sequence: '', operationCode: 'DRIDX', kind: 'INDEX' },
]

export function splitTopLevelStatements(sql: string) {
  const statements: string[] = []
  let current = ''
  let state: 'normal' | 'single' | 'double' | 'lineComment' | 'blockComment' | 'dollar' = 'normal'
  let dollarTag = ''

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index]
    const next = sql[index + 1]
    current += char

    if (state === 'lineComment') {
      if (char === '\n') state = 'normal'
      continue
    }
    if (state === 'blockComment') {
      if (char === '*' && next === '/') {
        current += next
        index += 1
        state = 'normal'
      }
      continue
    }
    if (state === 'single') {
      if (char === "'" && next === "'") {
        current += next
        index += 1
      } else if (char === "'") state = 'normal'
      continue
    }
    if (state === 'double') {
      if (char === '"' && next === '"') {
        current += next
        index += 1
      } else if (char === '"') state = 'normal'
      continue
    }
    if (state === 'dollar') {
      if (sql.startsWith(dollarTag, index)) {
        current += dollarTag.slice(1)
        index += dollarTag.length - 1
        state = 'normal'
      }
      continue
    }

    if (char === '-' && next === '-') {
      current += next
      index += 1
      state = 'lineComment'
    } else if (char === '/' && next === '*') {
      current += next
      index += 1
      state = 'blockComment'
    } else if (char === "'") state = 'single'
    else if (char === '"') state = 'double'
    else if (char === '$') {
      const tag = sql.slice(index).match(/^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/)?.[0]
      if (tag) {
        current += tag.slice(1)
        index += tag.length - 1
        dollarTag = tag
        state = 'dollar'
      }
    } else if (char === ';') {
      if (stripComments(current).trim()) statements.push(current.trim())
      current = ''
    }
  }

  if (stripComments(current).trim()) statements.push(current.trim())
  return statements
}

export function analyzeSql(sql: string): SqlAnalysis {
  const statements = splitTopLevelStatements(sql)
  const searchable = stripComments(sql)
  const createRule =
    OPERATION_RULES.find((rule) => rule.pattern.test(searchable) && rule.operationCode.startsWith('CR')) ||
    OPERATION_RULES.find((rule) => rule.pattern.test(searchable) && !rule.operationCode.startsWith('DR')) ||
    OPERATION_RULES.find((rule) => rule.pattern.test(searchable))

  if (!createRule) {
    return { sequence: '', schema: '', objectName: '', operationCode: '', statementCount: statements.length }
  }

  const identity = extractIdentity(searchable, createRule.kind)
  return {
    sequence: createRule.sequence,
    schema: identity.schema,
    objectName: identity.objectName,
    operationCode: createRule.operationCode,
    parameterCount: createRule.kind === 'FUNCTION' ? extractFunctionParameterCount(searchable) : undefined,
    statementCount: statements.length,
  }
}

export function buildOutputName(analysis: SqlAnalysis, metadata: DeploymentMetadata) {
  const parts = [
    sanitizeName(analysis.sequence),
    sanitizeName(metadata.database),
    sanitizeName(analysis.schema),
    sanitizeName(analysis.objectName),
  ]
  if (analysis.operationCode === 'CRFUN' || analysis.operationCode === 'DRFUN') {
    parts.push(`P${analysis.parameterCount ?? 0}`)
  }
  parts.push(sanitizeName(analysis.operationCode))
  return `${parts.filter(Boolean).join('_')}.sql`
}

export function validateSql(
  sql: string,
  originalName: string,
  analysis: SqlAnalysis,
): ValidationFinding[] {
  const findings: ValidationFinding[] = []
  const searchable = stripComments(sql)
  const statements = splitTopLevelStatements(sql)

  if (!sql.trim()) findings.push(error('empty-file', 'The SQL file is empty.'))
  if (!analysis.sequence) findings.push(warning('missing-sequence', 'The deployment sequence number could not be inferred; complete the output filename manually.'))
  if (!analysis.schema) findings.push(warning('missing-schema', 'The schema name could not be inferred; complete the output filename manually.'))
  if (!analysis.objectName) findings.push(warning('missing-object', 'The SQL object name could not be inferred; complete the output filename manually.'))
  if (!analysis.operationCode) findings.push(warning('missing-operation', 'The operation code could not be inferred; complete the output filename manually.'))
  if (/\bCREATE\s+OR\s+REPLACE\b/i.test(searchable)) findings.push(warning('create-or-replace', 'CREATE OR REPLACE should be replaced with DROP IF EXISTS and CREATE.'))
  if (/\bCREATE\s+(?:OR\s+REPLACE\s+)?(?:FUNCTION|VIEW|TRIGGER)\b/i.test(searchable) && !/\bDROP\s+(?:FUNCTION|VIEW|TRIGGER)\s+IF\s+EXISTS\b/i.test(searchable)) {
    findings.push(warning('missing-drop', 'The script may require a matching DROP IF EXISTS statement.'))
  }
  if (/\bCREATE\s+SCHEMA\b/i.test(searchable) && !/\bCREATE\s+SCHEMA\s+IF\s+NOT\s+EXISTS\b/i.test(searchable)) findings.push(warning('schema-if-not-exists', 'CREATE SCHEMA should use IF NOT EXISTS.'))
  if (/\bALTER\s+TABLE\b/i.test(searchable) && /\bADD\s+COLUMN\b/i.test(searchable) && !/\bADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\b/i.test(searchable)) findings.push(warning('alter-if-not-exists', 'ADD COLUMN should use IF NOT EXISTS.'))
  if (statements.length > 2) findings.push(warning('multiple-ddl', `The file contains ${statements.length} top-level statements; review the one-DDL-per-file guideline.`))
  if (/\bINSERT\s+INTO\b/i.test(searchable) && /\b(?:^|[,(]\s*)(?:id|[a-z_]+_id)\s*(?:,|\))/im.test(searchable) && /\bVALUES\s*\(\s*\d+/i.test(searchable)) findings.push(warning('hardcoded-id', 'The INSERT may contain a hardcoded ID; use auto-increment or generated IDs for configuration data.'))
  if (analysis.operationCode && !originalName.toUpperCase().includes(analysis.operationCode)) findings.push(warning('filename-mismatch', `The uploaded filename does not contain the inferred operation code ${analysis.operationCode}.`))
  return findings
}

function extractIdentity(sql: string, kind: string) {
  const patterns: Record<string, RegExp> = {
    SCHEMA: /\b(?:CREATE(?:\s+OR\s+REPLACE)?|DROP)\s+SCHEMA(?:\s+IF\s+(?:NOT\s+)?EXISTS)?\s+([^\s;]+)/i,
    TABLE: /\b(?:CREATE|DROP|ALTER)\s+TABLE(?:\s+IF\s+(?:NOT\s+)?EXISTS)?\s+([^\s(;]+)/i,
    VIEW: /\b(?:CREATE(?:\s+OR\s+REPLACE)?|DROP)\s+(?:MATERIALIZED\s+)?VIEW(?:\s+IF\s+EXISTS)?\s+([^\s(;]+)/i,
    FUNCTION: /\b(?:CREATE(?:\s+OR\s+REPLACE)?|DROP)\s+FUNCTION(?:\s+IF\s+EXISTS)?\s+([^\s(;]+)/i,
    TRIGGER: /\b(?:CREATE|DROP)\s+TRIGGER(?:\s+IF\s+EXISTS)?\s+([^\s(;]+)/i,
    INSERT: /\bINSERT\s+INTO\s+([^\s(;]+)/i,
    UPDATE: /\bUPDATE\s+([^\s(;]+)/i,
    DELETE: /\bDELETE\s+FROM\s+([^\s(;]+)/i,
    INDEX: /\b(?:CREATE\s+(?:UNIQUE\s+)?INDEX(?:\s+IF\s+NOT\s+EXISTS)?|DROP\s+INDEX(?:\s+IF\s+EXISTS)?)\s+([^\s(;]+)/i,
  }
  const raw = patterns[kind]?.exec(sql)?.[1]?.replaceAll('"', '') || ''
  const targetTable = /\bON\s+([A-Za-z0-9_".-]+)\b/i.exec(sql)?.[1]?.replaceAll('"', '') || ''
  const inferredSchema = targetTable.includes('.') ? targetTable.split('.').slice(-2)[0] : ''
  const [schema, objectName] = raw.includes('.')
    ? raw.split('.').slice(-2)
    : [kind === 'SCHEMA' ? raw : inferredSchema, kind === 'SCHEMA' ? raw : raw]
  return { schema: schema || '', objectName: objectName || '' }
}

function extractFunctionParameterCount(sql: string) {
  const match = /\bCREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+[^\s(]+\s*\(/i.exec(sql)
  if (!match) return 0
  const openingIndex = match.index + match[0].lastIndexOf('(')
  const parameters = readBalancedParentheses(sql, openingIndex)
  if (!parameters.trim()) return 0
  return splitParameters(parameters).length
}

function readBalancedParentheses(value: string, openingIndex: number) {
  let depth = 0
  let quote = false
  let result = ''
  for (let index = openingIndex; index < value.length; index += 1) {
    const char = value[index]
    const next = value[index + 1]
    if (char === "'" && next === "'") {
      if (depth > 0) result += "''"
      index += 1
      continue
    }
    if (char === "'") quote = !quote
    if (!quote && char === '(') {
      depth += 1
      if (depth === 1) continue
    }
    if (!quote && char === ')') {
      depth -= 1
      if (depth === 0) return result
    }
    if (depth > 0) result += char
  }
  return result
}

function splitParameters(value: string) {
  const parameters: string[] = []
  let depth = 0
  let current = ''
  let quote = false
  for (const char of value) {
    if (char === "'") quote = !quote
    if (!quote && char === '(') depth += 1
    if (!quote && char === ')') depth -= 1
    if (!quote && char === ',' && depth === 0) {
      parameters.push(current.trim())
      current = ''
    } else current += char
  }
  if (current.trim()) parameters.push(current.trim())
  return parameters
}

function stripComments(sql: string) {
  return sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
}

function sanitizeName(value: string) {
  return String(value || '').trim().replace(/\s+/g, '-').replace(/[^A-Za-z0-9.-]/g, '_')
}

function error(code: string, message: string): ValidationFinding {
  return { code, message, severity: 'error' }
}

function warning(code: string, message: string): ValidationFinding {
  return { code, message, severity: 'warning' }
}
