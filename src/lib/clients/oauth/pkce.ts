import crypto from 'crypto'

export async function getPKCE(): Promise<
  | {
      code_verifier: string
      code_challenge: string
      code_challenge_method: 'S256'
    }
  | never
> {
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await getCodeChallenge(codeVerifier)

  return {
    code_verifier: codeVerifier,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  }
}

function generateCodeVerifier(): string {
  const codeVerifier = crypto.randomBytes(32).toString('base64')
  return codeVerifier
}

async function getCodeChallenge(codeVerifier: string): Promise<string> {
  const codeChallenge = await crypto.subtle.digest('SHA-256', Buffer.from(codeVerifier))

  return base64Url(codeChallenge)
}

function base64Url(buffer: ArrayBuffer) {
  const uint8Array = new Uint8Array(buffer)

  let binaryString = ''
  for (const element of uint8Array) {
    binaryString += String.fromCharCode(element)
  }

  const base64String = btoa(binaryString)

  return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
