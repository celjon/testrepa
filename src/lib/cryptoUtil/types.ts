// DEK = Data Encryption Key
// EDEK = Encrypted DEK
// KEK = Key Encryption Key
//

export interface ICryptoUtil {
  getKeyFromString(str: string): Promise<Buffer>

  generateKEKSalt(): Promise<Buffer>

  deriveKEK(params: DeriveKEKParams): Promise<string>

  generateDEK(): Promise<Buffer>

  encryptDEK(params: EncryptDEKParams): Promise<Buffer>

  decryptDEK(params: DecryptDEKParams): Promise<Buffer>

  encrypt(params: EncryptParams): Promise<string>

  decrypt(params: DecryptParams): Promise<string>

  encryptBytes(params: EncryptBytesParams): Promise<Buffer>

  decryptBytes(params: DecryptBytesParams): Promise<Buffer>
}

export type DeriveKEKParams = {
  password: string
  kekSalt: Uint8Array<ArrayBufferLike>
}

export type EncryptDEKParams = {
  kek: string
  dek: Uint8Array<ArrayBufferLike>
}

export type DecryptDEKParams = {
  kek: string
  edek: Uint8Array<ArrayBufferLike>
}

export type EncryptParams = {
  dek: Uint8Array<ArrayBufferLike>
  data: string
}

export type DecryptParams = {
  dek: Uint8Array<ArrayBufferLike>
  encryptedData: string
}

export type EncryptBytesParams = {
  dek: Buffer
  data: Buffer
}

export type DecryptBytesParams = {
  dek: Buffer
  encryptedData: Buffer
}
