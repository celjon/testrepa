import {
  DecryptBytesParams,
  DecryptDEKParams,
  DecryptParams,
  DeriveKEKParams,
  EncryptBytesParams,
  EncryptDEKParams,
  EncryptParams,
  ICryptoUtil
} from './types'

const crypto = globalThis.crypto

const constants = {
  SALT_BYTE_LEN: 16,
  PBKDF2_ITERATIONS: 1000,
  PBKDF2_HASH: 'SHA-256',

  ENCRYPTION: 'AES-GCM',
  IV_BYTE_LEN: 12,
  DEK_BYTE_LEN: 32,
  AUTH_TAG_BIT_LEN: 128 // 16 bytes
} as const

const BUFFER_STRING_REPR = 'base64' as const

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const generateIV = async () => crypto.getRandomValues(new Uint8Array(constants.IV_BYTE_LEN))

const generateRandomBytes = async (length: number) => crypto.getRandomValues(new Uint8Array(length))

const generateKEKSalt = async (): Promise<Buffer> => Buffer.from(await generateRandomBytes(constants.SALT_BYTE_LEN))

const getKeyFromString = async (str: string) => {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(str)

  // Create a hash of the key string to get consistent key material
  const hash = await crypto.subtle.digest('SHA-256', keyData)

  const key = await crypto.subtle.importKey('raw', hash, { name: constants.ENCRYPTION }, true, ['encrypt', 'decrypt'])

  const exportedKey = await crypto.subtle.exportKey('raw', key)

  return Buffer.from(exportedKey)
}

const deriveKEK = async ({ password, kekSalt }: DeriveKEKParams): Promise<string> => {
  const encodedPassword = encoder.encode(password)
  const key = await crypto.subtle.importKey('raw', encodedPassword, 'PBKDF2', false, ['deriveKey'])

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: kekSalt,
      iterations: constants.PBKDF2_ITERATIONS,
      hash: constants.PBKDF2_HASH
    },
    key,
    { name: constants.ENCRYPTION, length: 256 },
    true,
    ['encrypt', 'decrypt']
  )

  const exportedKey = await crypto.subtle.exportKey('raw', derivedKey)

  return Buffer.from(exportedKey).toString(BUFFER_STRING_REPR)
}

const generateDEK = async (): Promise<Buffer> => Buffer.from(await generateRandomBytes(constants.DEK_BYTE_LEN))

const encryptDEK = async ({ kek, dek }: EncryptDEKParams): Promise<Buffer> => {
  try {
    const key = await crypto.subtle.importKey('raw', Buffer.from(kek, BUFFER_STRING_REPR), constants.ENCRYPTION, false, ['encrypt'])

    const iv = await generateIV()
    const encrypted = await crypto.subtle.encrypt(
      {
        name: constants.ENCRYPTION,
        iv,
        tagLength: constants.AUTH_TAG_BIT_LEN
      },
      key,
      dek
    )

    return Buffer.concat([Buffer.from(iv), Buffer.from(encrypted)])
  } catch (e) {
    const error = new Error('ENCRYPT_DEK_FAILED')
    error.cause = e
    throw error
  }
}

const decryptDEK = async ({ kek, edek }: DecryptDEKParams): Promise<Buffer> => {
  try {
    const key = await crypto.subtle.importKey('raw', Buffer.from(kek, BUFFER_STRING_REPR), constants.ENCRYPTION, false, ['decrypt'])

    const iv = edek.subarray(0, constants.IV_BYTE_LEN)
    const encrypted = edek.subarray(constants.IV_BYTE_LEN)

    const decrypted = await crypto.subtle.decrypt(
      {
        name: constants.ENCRYPTION,
        iv,
        tagLength: constants.AUTH_TAG_BIT_LEN
      },
      key,
      encrypted
    )
    return Buffer.from(decrypted)
  } catch (e) {
    const error = new Error('DECRYPT_DEK_FAILED')
    error.cause = e
    throw error
  }
}

const encrypt = async ({ dek, data }: EncryptParams): Promise<string> => {
  try {
    const key = await crypto.subtle.importKey('raw', dek, constants.ENCRYPTION, false, ['encrypt'])

    const encodedData = encoder.encode(data)
    const iv = await generateIV()
    const encrypted = await crypto.subtle.encrypt(
      {
        name: constants.ENCRYPTION,
        iv,
        tagLength: constants.AUTH_TAG_BIT_LEN
      },
      key,
      encodedData
    )

    return Buffer.concat([Buffer.from(iv), Buffer.from(encrypted)]).toString(BUFFER_STRING_REPR)
  } catch (e) {
    const error = new Error('ENCRYPT_FAILED')
    error.cause = e
    throw error
  }
}

const decrypt = async ({ dek, encryptedData }: DecryptParams): Promise<string> => {
  try {
    const key = await crypto.subtle.importKey('raw', dek, constants.ENCRYPTION, false, ['decrypt'])

    const encryptedDataBuffer = Buffer.from(encryptedData, BUFFER_STRING_REPR)
    const iv = encryptedDataBuffer.subarray(0, constants.IV_BYTE_LEN)
    const encrypted = encryptedDataBuffer.subarray(constants.IV_BYTE_LEN)

    const decrypted = await crypto.subtle.decrypt(
      {
        name: constants.ENCRYPTION,
        iv,
        tagLength: constants.AUTH_TAG_BIT_LEN
      },
      key,
      encrypted
    )
    const decodedData = decoder.decode(decrypted)

    return decodedData
  } catch (e) {
    const error = new Error('DECRYPT_FAILED')
    error.cause = e
    throw error
  }
}

const encryptBytes = async ({ dek, data }: EncryptBytesParams) => {
  try {
    const key = await crypto.subtle.importKey('raw', dek, constants.ENCRYPTION, false, ['encrypt'])

    const iv = await generateIV()
    const encrypted = await crypto.subtle.encrypt(
      {
        name: constants.ENCRYPTION,
        iv,
        tagLength: constants.AUTH_TAG_BIT_LEN
      },
      key,
      data
    )

    return Buffer.concat([Buffer.from(iv), Buffer.from(encrypted)])
  } catch (e) {
    const error = new Error('ENCRYPT_BYTES_FAILED')
    error.cause = e
    throw error
  }
}

const decryptBytes = async ({ dek, encryptedData }: DecryptBytesParams) => {
  try {
    const key = await crypto.subtle.importKey('raw', dek, constants.ENCRYPTION, false, ['decrypt'])

    const iv = encryptedData.subarray(0, constants.IV_BYTE_LEN)
    const encrypted = encryptedData.subarray(constants.IV_BYTE_LEN)

    const decrypted = await crypto.subtle.decrypt(
      {
        name: constants.ENCRYPTION,
        iv,
        tagLength: constants.AUTH_TAG_BIT_LEN
      },
      key,
      encrypted
    )

    return Buffer.from(decrypted)
  } catch (e) {
    const error = new Error('DECRYPT_BYTES_FAILED')
    error.cause = e
    throw error
  }
}

export const cryptoUtil: ICryptoUtil = {
  getKeyFromString,

  generateKEKSalt,
  deriveKEK,

  generateDEK,
  encryptDEK,
  decryptDEK,

  encrypt,
  decrypt,

  encryptBytes,
  decryptBytes
}
