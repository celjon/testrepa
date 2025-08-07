import { cryptoUtil } from '@/lib/crypto-util'

export type GetKeyFromString = (str: string) => Promise<Buffer>

export type GenerateKEKSalt = () => Promise<Buffer>

export type DeriveKEK = (params: {
  password: string
  kekSalt: Uint8Array<ArrayBufferLike>
}) => Promise<string>

export type GenerateDEK = () => Promise<Buffer>

export type EncryptDEK = (params: {
  kek: string
  dek: Uint8Array<ArrayBufferLike>
}) => Promise<Buffer>

export type DecryptDEK = (params: {
  kek: string
  edek: Uint8Array<ArrayBufferLike>
}) => Promise<Buffer>

export type Encrypt = (params: {
  dek: Uint8Array<ArrayBufferLike>
  data: string
}) => Promise<string>

export type Decrypt = (params: {
  dek: Uint8Array<ArrayBufferLike>
  encryptedData: string
}) => Promise<string>

export type EncryptBytes = (params: { dek: Buffer; data: Buffer }) => Promise<Buffer>

export type DecryptBytes = (params: { dek: Buffer; encryptedData: Buffer }) => Promise<Buffer>

export type CryptoGateway = {
  getKeyFromString: GetKeyFromString

  generateKEKSalt: GenerateKEKSalt
  deriveKEK: DeriveKEK

  generateDEK: GenerateDEK
  encryptDEK: EncryptDEK
  decryptDEK: DecryptDEK

  encrypt: Encrypt
  decrypt: Decrypt

  encryptBytes: EncryptBytes
  decryptBytes: DecryptBytes
}

export const buildCryptoGateway = (): CryptoGateway => {
  return cryptoUtil
}
