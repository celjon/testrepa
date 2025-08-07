export function stripNullCharacters(input: string) {
  return input.replace(/\0/g, '')
}
