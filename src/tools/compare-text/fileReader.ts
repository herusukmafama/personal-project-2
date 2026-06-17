const TEXT_FILE_PATTERN =
  /\.(txt|sql|json|md|markdown|xml|html|htm|csv|tsv|log|yaml|yml|ini|env|js|ts|tsx|jsx|css|scss|java|py|cs|go|rs|php|rb)$/i

export async function readTextLikeFile(file: File) {
  if (!isTextLikeFile(file)) {
    throw new Error('Only text-like files are supported.')
  }

  return file.text()
}

function isTextLikeFile(file: File) {
  return (
    !file.type ||
    file.type.startsWith('text/') ||
    file.type === 'application/json' ||
    file.type === 'application/xml' ||
    file.type === 'application/sql' ||
    TEXT_FILE_PATTERN.test(file.name)
  )
}

