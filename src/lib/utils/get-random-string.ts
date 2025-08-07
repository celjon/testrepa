import crypto from 'crypto'

export function getRandomString(length: number, withHyphens = false): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charsLength = chars.length
  const array = new Uint8Array(length)

  crypto.getRandomValues(array)

  const raw = Array.from(array, (byte) => chars[byte % charsLength]).join('')

  if (!withHyphens) return raw

  return raw.match(/.{1,4}/g)?.join('-') ?? raw
}
