import path, { extname } from 'path'
import fs from 'fs/promises'

import { describe, expect, test } from 'vitest'
import { buildDocumentGateway } from '@/adapter/gateway/document'
import { cryptoUtil } from '../crypto-util'

describe('Data Encryption Key', () => {
  test('Encrypt and decrypt DEK', async () => {
    const dek = await cryptoUtil.generateDEK()
    const kekSalt = await cryptoUtil.generateKEKSalt()
    const kek = await cryptoUtil.deriveKEK({
      password: 'password',
      kekSalt,
    })
    const edek = await cryptoUtil.encryptDEK({ kek, dek })
    const dek2 = await cryptoUtil.decryptDEK({ kek, edek })

    expect(dek).toBeTruthy()
    expect(kek).toBeTruthy()
    expect(edek).toBeTruthy()
    expect(dek2).toBeTruthy()
    expect(dek2).toEqual(dek)
  })

  test('Encrypt and decrypt DEK', async () => {
    const dek = await cryptoUtil.generateDEK()
    const kekSalt = await cryptoUtil.generateKEKSalt()
    const kek = await cryptoUtil.deriveKEK({ password: '1', kekSalt })
    const edek = await cryptoUtil.encryptDEK({ kek, dek })
    const dek2 = await cryptoUtil.decryptDEK({ kek, edek })

    expect(dek).toBeTruthy()
    expect(kek).toBeTruthy()
    expect(edek).toBeTruthy()
    expect(dek2).toBeTruthy()
    expect(dek2).toEqual(dek)
  })
})

describe('Encryption and Decryption of Data', () => {
  test('Encrypt and decrypt data', async () => {
    const data =
      'Hello world! I am prototyping data encryption and decryption using AES 256 GCM algorithm.'

    const dek = await cryptoUtil.generateDEK()
    const encryptedData = await cryptoUtil.encrypt({ dek, data })
    const decryptedData = await cryptoUtil.decrypt({ dek, encryptedData })

    expect(data).toBeTruthy()
    expect(decryptedData).toEqual(data)
  })

  test('Encrypt and decrypt empty data', async () => {
    const data = ''

    const dek = await cryptoUtil.generateDEK()
    const encryptedData = await cryptoUtil.encrypt({ dek, data })
    const decryptedData = await cryptoUtil.decrypt({ dek, encryptedData })

    expect(decryptedData).toEqual(data)
  })

  test('Decryption with invalid KEK should throw an error', async () => {
    const dek = await cryptoUtil.generateDEK()
    const kekSalt = await cryptoUtil.generateKEKSalt()
    const kek = await cryptoUtil.deriveKEK({
      password: 'password',
      kekSalt,
    })
    const edek = await cryptoUtil.encryptDEK({ kek, dek })
    const newKEKSalt = await cryptoUtil.generateKEKSalt()
    const invalidKEK = await cryptoUtil.deriveKEK({
      password: 'newpassword',
      kekSalt: newKEKSalt,
    })

    await expect(cryptoUtil.decryptDEK({ kek: invalidKEK, edek })).rejects.toThrow()
  })

  test('decryption with invalid DEK should throw an error', async () => {
    const data = 'Hello world!'

    const dek = await cryptoUtil.generateDEK()
    const encryptedData = await cryptoUtil.encrypt({ dek, data })
    const newDek = await cryptoUtil.generateDEK()

    await expect(cryptoUtil.decrypt({ dek: newDek, encryptedData })).rejects.toThrow()
  })

  test('Encrypt and decrypt very long data', async () => {
    const data = new Array(1000000)
      .fill(null)
      .map((_, idx) => {
        return String.fromCharCode(Math.round(Math.random() * idx) % 2 ** 8)
      })
      .join('')

    const dek = await cryptoUtil.generateDEK()
    const encryptedData = await cryptoUtil.encrypt({ dek, data })
    const decryptedData = await cryptoUtil.decrypt({ dek, encryptedData })

    expect(decryptedData).toEqual(data)
  })

  test('Encrypt and decrypt data with random UTF-8 characters', async () => {
    const rawData = new Array(1000000)
      .fill(null)
      .map(() => {
        return String.fromCodePoint(Math.round(Math.random() * 1000000) % 0x10ffff)
      })
      .join('')
    // Convert to valid UTF-8 string
    const validUTF8Data = Buffer.from(rawData, 'utf8').toString('utf8')

    const dek = await cryptoUtil.generateDEK()
    const encryptedData = await cryptoUtil.encrypt({
      dek,
      data: validUTF8Data,
    })
    const decryptedData = await cryptoUtil.decrypt({ dek, encryptedData })

    expect(decryptedData).toEqual(validUTF8Data)
  })

  test('Encryption and decryption of data with files serialized to string', async () => {
    const documentGateway = buildDocumentGateway()
    const typeMap: Record<string, 'text' | 'word' | 'excel' | 'pdf'> = {
      '.docx': 'word',
      '.xlsx': 'excel',
      '.pdf': 'pdf',
    }

    const data = 'Hello, I am Steeve'
    const filesDir = path.resolve(__dirname, './fixtures')
    const files = await fs.readdir(filesDir)

    const prompts: string[] = await Promise.all(
      files.map(async (fileName) => {
        const filePath = path.resolve(filesDir, fileName)
        const fileBuffer: Buffer = await fs.readFile(filePath)

        const ext = extname(fileName)

        const doc = await documentGateway.toMarkdown({
          type: typeMap[ext] ? typeMap[ext] : 'text',
          buffer: fileBuffer,
          convertImage: async (_, ext) => `img${ext}`,
        })
        return data + doc
      }),
    )

    const dek = await cryptoUtil.generateDEK()

    await Promise.all(
      prompts.map(async (prompt) => {
        const encryptedData = await cryptoUtil.encrypt({
          dek,
          data: prompt,
        })
        const decryptedData = await cryptoUtil.decrypt({
          dek,
          encryptedData,
        })
        expect(decryptedData).toEqual(prompt)
      }),
    )
  })

  test('Encrypt and decrypt bytes data', async () => {
    const filesDir = path.resolve(__dirname, './fixtures')
    const files = await fs.readdir(filesDir)
    const filesData = await Promise.all(
      files.map(async (fileName) => {
        const filePath = path.resolve(filesDir, fileName)
        return fs.readFile(filePath)
      }),
    )

    const dek = await cryptoUtil.generateDEK()
    const encryptedData = await Promise.all(
      filesData.map((fileData) => {
        return cryptoUtil.encryptBytes({ dek, data: fileData })
      }),
    )
    const decryptedData = await Promise.all(
      encryptedData.map((encrypted) => {
        return cryptoUtil.decryptBytes({
          dek,
          encryptedData: encrypted,
        })
      }),
    )

    expect(decryptedData).toEqual(filesData)
  })
})

test('Encrypt and decrypt data full flow', async () => {
  // register user
  const password = 'password'
  let dek = await cryptoUtil.generateDEK()
  const kekSalt = await cryptoUtil.generateKEKSalt()
  let kek = await cryptoUtil.deriveKEK({ password, kekSalt })
  const edek = await cryptoUtil.encryptDEK({ kek, dek })

  // login user
  kek = await cryptoUtil.deriveKEK({ password, kekSalt })

  // encrypt data
  const data = 'Hello, I am Steeve'
  dek = await cryptoUtil.decryptDEK({ kek, edek })
  const encryptedData = await cryptoUtil.encrypt({ dek, data })

  // decrypt data
  dek = await cryptoUtil.decryptDEK({ kek, edek })
  const decryptedData = await cryptoUtil.decrypt({ dek, encryptedData })

  expect(decryptedData).toEqual(data)
})
