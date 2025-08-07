// removes non-JSON outer content from a string
export function leaveJSON(input: string) {
  const startIndex = input.indexOf('{')
  const endIndex = input.lastIndexOf('}')

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    return input.slice(startIndex, endIndex + 1)
  }

  return input.trim()
}
