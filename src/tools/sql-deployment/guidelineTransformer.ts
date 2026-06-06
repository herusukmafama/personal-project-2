import { formatPostgresqlSql } from './sqlFormatter'
import type { ProposedFix } from './types'

export type GuidelineProposal = {
  proposedSql: string
  fixes: ProposedFix[]
}

export function proposeGuidelineFixes(formattedSql: string): GuidelineProposal {
  let proposedSql = formattedSql
  const fixes: ProposedFix[] = []

  proposedSql = replaceCreateOrReplaceFunction(proposedSql, fixes)
  proposedSql = replaceCreateOrReplaceView(proposedSql, fixes)
  proposedSql = addFunctionDrop(proposedSql, fixes)
  proposedSql = addViewDrop(proposedSql, fixes)
  proposedSql = addTriggerDrop(proposedSql, fixes)
  proposedSql = addSchemaIfNotExists(proposedSql, fixes)
  proposedSql = addColumnIfNotExists(proposedSql, fixes)
  proposedSql = addTableDrop(proposedSql, fixes)
  proposedSql = addMaterializedViewDrop(proposedSql, fixes)

  return {
    proposedSql: fixes.length ? formatPostgresqlSql(proposedSql) : formattedSql,
    fixes,
  }
}

function replaceCreateOrReplaceFunction(sql: string, fixes: ProposedFix[]) {
  const pattern = /\bCREATE\s+OR\s+REPLACE\s+FUNCTION\s+((?:"[^"]+"|[A-Za-z_][A-Za-z0-9_$]*)(?:\.(?:"[^"]+"|[A-Za-z_][A-Za-z0-9_$]*))?)\s*\(/i
  const match = pattern.exec(sql)
  if (!match) return sql
  const openingIndex = match.index + match[0].lastIndexOf('(')
  const parameterText = readBalancedParentheses(sql, openingIndex)
  if (parameterText === null) return sql
  const parameterTypes = splitParameters(parameterText).map(extractInputParameterType)
  if (parameterTypes.some((type) => !type)) return sql
  const hasDrop = /\bDROP\s+FUNCTION\s+IF\s+EXISTS\b/i.test(sql)
  const drop = `DROP FUNCTION IF EXISTS ${match[1]}(${parameterTypes.join(', ')});\n\n`
  fixes.push(fix('function-drop-create', 'Replace CREATE OR REPLACE FUNCTION', hasDrop ? `Keep the existing DROP and use CREATE FUNCTION for ${match[1]}.` : `Add a matching DROP FUNCTION IF EXISTS signature before ${match[1]} and use CREATE FUNCTION.`, 'safe'))
  const replaced = sql.replace(pattern, `CREATE FUNCTION ${match[1]}(`)
  return hasDrop ? replaced : insertAt(replaced, match.index, drop)
}

function replaceCreateOrReplaceView(sql: string, fixes: ProposedFix[]) {
  const pattern = /\bCREATE\s+OR\s+REPLACE\s+VIEW\s+((?:"[^"]+"|[A-Za-z_][A-Za-z0-9_$]*)(?:\.(?:"[^"]+"|[A-Za-z_][A-Za-z0-9_$]*))?)/i
  const match = pattern.exec(sql)
  if (!match) return sql
  const hasDrop = /\bDROP\s+VIEW\s+IF\s+EXISTS\b/i.test(sql)
  fixes.push(fix('view-drop-create', 'Replace CREATE OR REPLACE VIEW', hasDrop ? `Keep the existing DROP and use CREATE VIEW for ${match[1]}.` : `Add DROP VIEW IF EXISTS ${match[1]} before CREATE VIEW.`, 'safe'))
  const replaced = sql.replace(pattern, `CREATE VIEW ${match[1]}`)
  return hasDrop ? replaced : insertAt(replaced, match.index, `DROP VIEW IF EXISTS ${match[1]};\n\n`)
}

function addFunctionDrop(sql: string, fixes: ProposedFix[]) {
  if (/\bDROP\s+FUNCTION\s+IF\s+EXISTS\b/i.test(sql)) return sql
  const pattern = /\bCREATE\s+FUNCTION\s+((?:"[^"]+"|[A-Za-z_][A-Za-z0-9_$]*)(?:\.(?:"[^"]+"|[A-Za-z_][A-Za-z0-9_$]*))?)\s*\(/i
  const match = pattern.exec(sql)
  if (!match) return sql
  const openingIndex = match.index + match[0].lastIndexOf('(')
  const parameterText = readBalancedParentheses(sql, openingIndex)
  if (parameterText === null) return sql
  const parameterTypes = splitParameters(parameterText).map(extractInputParameterType)
  if (parameterTypes.some((type) => !type)) return sql
  fixes.push(fix('function-drop', 'Add DROP FUNCTION IF EXISTS', `Add a matching DROP FUNCTION signature before ${match[1]}.`, 'safe'))
  return insertAt(sql, match.index, `DROP FUNCTION IF EXISTS ${match[1]}(${parameterTypes.join(', ')});\n\n`)
}

function addViewDrop(sql: string, fixes: ProposedFix[]) {
  if (/\bDROP\s+VIEW\s+IF\s+EXISTS\b/i.test(sql) || /\bCREATE\s+MATERIALIZED\s+VIEW\b/i.test(sql)) return sql
  const match = /\bCREATE\s+VIEW\s+((?:"[^"]+"|[A-Za-z_][A-Za-z0-9_$]*)(?:\.(?:"[^"]+"|[A-Za-z_][A-Za-z0-9_$]*))?)/i.exec(sql)
  if (!match) return sql
  fixes.push(fix('view-drop', 'Add DROP VIEW IF EXISTS', `Add a matching DROP VIEW statement before ${match[1]}.`, 'safe'))
  return insertAt(sql, match.index, `DROP VIEW IF EXISTS ${match[1]};\n\n`)
}

function addTriggerDrop(sql: string, fixes: ProposedFix[]) {
  if (/\bDROP\s+TRIGGER\s+IF\s+EXISTS\b/i.test(sql)) return sql
  const match = /\bCREATE\s+TRIGGER\s+("[^"]+"|[A-Za-z_][A-Za-z0-9_$]*)[\s\S]*?\bON\s+((?:"[^"]+"|[A-Za-z_][A-Za-z0-9_$]*)(?:\.(?:"[^"]+"|[A-Za-z_][A-Za-z0-9_$]*))?)/i.exec(sql)
  if (!match) return sql
  fixes.push(fix('trigger-drop', 'Add DROP TRIGGER IF EXISTS', `Add a matching DROP statement for ${match[1]} on ${match[2]}.`, 'safe'))
  return insertAt(sql, match.index, `DROP TRIGGER IF EXISTS ${match[1]} ON ${match[2]};\n\n`)
}

function addSchemaIfNotExists(sql: string, fixes: ProposedFix[]) {
  const pattern = /\bCREATE\s+SCHEMA\s+(?!IF\s+NOT\s+EXISTS\b)/i
  if (!pattern.test(sql)) return sql
  fixes.push(fix('schema-if-not-exists', 'Add schema existence guard', 'Add IF NOT EXISTS to CREATE SCHEMA.', 'safe'))
  return sql.replace(pattern, 'CREATE SCHEMA IF NOT EXISTS ')
}

function addColumnIfNotExists(sql: string, fixes: ProposedFix[]) {
  const pattern = /\bADD\s+COLUMN\s+(?!IF\s+NOT\s+EXISTS\b)/gi
  if (!pattern.test(sql)) return sql
  fixes.push(fix('column-if-not-exists', 'Add column existence guard', 'Add IF NOT EXISTS to straightforward ADD COLUMN clauses.', 'safe'))
  return sql.replace(pattern, 'ADD COLUMN IF NOT EXISTS ')
}

function addTableDrop(sql: string, fixes: ProposedFix[]) {
  if (/\bDROP\s+TABLE\s+IF\s+EXISTS\b/i.test(sql)) return sql
  const match = /\bCREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+((?:"[^"]+"|[A-Za-z_][A-Za-z0-9_$]*)(?:\.(?:"[^"]+"|[A-Za-z_][A-Za-z0-9_$]*))?)/i.exec(sql)
  if (!match) return sql
  fixes.push(fix('table-drop', 'Add DROP TABLE IF EXISTS', `Dropping ${match[1]} can destroy existing data and requires explicit approval.`, 'confirmation-required'))
  return insertAt(sql, match.index, `DROP TABLE IF EXISTS ${match[1]};\n\n`)
}

function addMaterializedViewDrop(sql: string, fixes: ProposedFix[]) {
  if (/\bDROP\s+MATERIALIZED\s+VIEW\s+IF\s+EXISTS\b/i.test(sql)) return sql
  const match = /\bCREATE\s+MATERIALIZED\s+VIEW\s+((?:"[^"]+"|[A-Za-z_][A-Za-z0-9_$]*)(?:\.(?:"[^"]+"|[A-Za-z_][A-Za-z0-9_$]*))?)/i.exec(sql)
  if (!match) return sql
  fixes.push(fix('materialized-view-drop', 'Add DROP MATERIALIZED VIEW IF EXISTS', `Dropping ${match[1]} requires explicit approval.`, 'confirmation-required'))
  return insertAt(sql, match.index, `DROP MATERIALIZED VIEW IF EXISTS ${match[1]};\n\n`)
}

function extractInputParameterType(parameter: string) {
  const withoutDefault = parameter.replace(/\s+(?:DEFAULT\b|=)[\s\S]*$/i, '').trim()
  const withoutMode = withoutDefault.replace(/^(?:INOUT|IN|VARIADIC)\s+/i, '').trim()
  if (/^OUT\s+/i.test(withoutDefault)) return ''
  const tokens = withoutMode.match(/(?:"[^"]+"|[^\s])+/g) || []
  if (tokens.length < 2) return tokens[0] || ''
  return tokens.slice(1).join(' ')
}

function readBalancedParentheses(value: string, openingIndex: number) {
  let depth = 0
  let single = false
  let double = false
  let result = ''
  for (let index = openingIndex; index < value.length; index += 1) {
    const char = value[index]
    const next = value[index + 1]
    if (single && char === "'" && next === "'") {
      if (depth > 0) result += "''"
      index += 1
      continue
    }
    if (!double && char === "'") single = !single
    if (!single && char === '"') double = !double
    if (!single && !double && char === '(') {
      depth += 1
      if (depth === 1) continue
    }
    if (!single && !double && char === ')') {
      depth -= 1
      if (depth === 0) return result
    }
    if (depth > 0) result += char
  }
  return null
}

function splitParameters(value: string) {
  const result: string[] = []
  let depth = 0
  let single = false
  let current = ''
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]
    const next = value[index + 1]
    if (single && char === "'" && next === "'") {
      current += "''"
      index += 1
      continue
    }
    if (char === "'") single = !single
    if (!single && char === '(') depth += 1
    if (!single && char === ')') depth -= 1
    if (!single && char === ',' && depth === 0) {
      result.push(current.trim())
      current = ''
    } else current += char
  }
  if (current.trim()) result.push(current.trim())
  return result
}

function fix(code: string, title: string, description: string, confidence: ProposedFix['confidence']): ProposedFix {
  return { code, title, description, confidence }
}

function insertAt(value: string, index: number, insertion: string) {
  return value.slice(0, index) + insertion + value.slice(index)
}
