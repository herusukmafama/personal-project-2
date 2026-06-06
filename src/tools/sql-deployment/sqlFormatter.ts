import { format } from 'sql-formatter'

export function formatPostgresqlSql(sql: string) {
  return format(sql, {
    language: 'postgresql',
    keywordCase: 'upper',
    tabWidth: 4,
    linesBetweenQueries: 2,
  }).trim() + '\n'
}
