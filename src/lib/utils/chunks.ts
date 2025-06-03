const QUOTE_ASCII_CODE = 34
const BACKSLASH_ASCII_CODE = 92
const CLOSING_BRACKET_ASCII_CODE = 125
const OPENING_BRACKET_ASCII_CODE = 123

export const processChunks = (value: string): [Array<string>, string] => {
  const escapedChars = new Map()

  let insideQuotes = false
  let prevCharCode = 0
  let start = 0

  const stack = []

  const result: Array<string> = []

  for (let i = start; i < value.length; i += 1) {
    const char = value[i]

    const charCode = char.charCodeAt(0)

    if (prevCharCode === BACKSLASH_ASCII_CODE && !escapedChars.has(i - 1)) {
      escapedChars.set(i, true)
    }

    if (charCode === QUOTE_ASCII_CODE && !escapedChars.has(i)) {
      insideQuotes = !insideQuotes
      continue
    }

    if (insideQuotes) {
      prevCharCode = charCode
      continue
    }

    if (charCode == OPENING_BRACKET_ASCII_CODE || charCode == CLOSING_BRACKET_ASCII_CODE) {
      stack.push(charCode)
    }

    const end = stack.length - 1

    if (stack[end] == CLOSING_BRACKET_ASCII_CODE && stack[end - 1] == OPENING_BRACKET_ASCII_CODE) {
      stack.splice(end - 1, 2)
    }

    if (stack.length == 0) {
      result.push(value.slice(start, i + 1))
      start = i + 1
    }
    prevCharCode = charCode
  }

  let tail = ''

  if (stack.length > 0) {
    tail = value.slice(start, value.length)
  }

  return [result, tail]
}
