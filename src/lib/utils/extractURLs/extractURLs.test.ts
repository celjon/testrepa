import { describe, expect, test } from '@jest/globals'
import { extractURLs } from './extractURLs'

describe('extractURLs', () => {
  test('extracts URLs from a string', () => {
    const text = 'This is a test. Check out this link https://www.youtube.com/watch?v=qcC_DGkFRSA api.sberbank.ru'
    const result = extractURLs(text)

    expect(result).toEqual(['https://www.youtube.com/watch?v=qcC_DGkFRSA', 'api.sberbank.ru'])
  })

  test('extracts URLs from a string with multiple URLs', () => {
    const text =
      'This is a test. Check out this link https://www.youtube.com/watch?v=qcC_DGkFRSA and this one https://www.youtube.com/watch?v=adwdw_dwa'
    const result = extractURLs(text)

    expect(result).toEqual(['https://www.youtube.com/watch?v=qcC_DGkFRSA', 'https://www.youtube.com/watch?v=adwdw_dwa'])
  })

  test('extracts URLs from a string with multiple URLs and text', () => {
    const text =
      'This is a test. Check out this link https://www.youtube.com/watch?v=qcC_DGkFRSA1 and this one https://www.youtube.com/watch?v=qcC_DGkFRSA2. This is another test https://www.youtube.com/watch?v=qcC_DGkFRSA3'
    const result = extractURLs(text)

    expect(result).toEqual([
      'https://www.youtube.com/watch?v=qcC_DGkFRSA1',
      'https://www.youtube.com/watch?v=qcC_DGkFRSA2',
      'https://www.youtube.com/watch?v=qcC_DGkFRSA3'
    ])
  })

  test('removes duplicate URLs', () => {
    const text = `
      https://www.youtube.com/watch?v=qcC_DGkFRSA 
      https://www.youtube.com/watch?v=qcC_DGkFRSA 
      https://www.youtube.com/watch?v=qcC_DGkFRSA`
    const result = extractURLs(text)

    expect(result).toEqual(['https://www.youtube.com/watch?v=qcC_DGkFRSA'])
  })

  test('do not extracts URLs with private hosts', () => {
    const text = `
      http://localhost:3000/api/v1/users/me
      https://localhost:3000/api/v1/users/me
      http://127.0.0.1:3000/api/v1/users/me
      https://127.0.0.1:3000/api/v1/users/me
      https://192.168.1.1:3000/api/v1/users/me
      http://10.0.0.1:3000/api/v1/users/me
      https://10.0.0.1:3000/api/v1/users/me
      http://172.16.0.1:3000/api/v1/users/me
      http://172.31.11.12:3000/api/v1/users/me
      http://172.32.11.12:3000/api/v1/users/me
      http://test.local:3000/api/v1/users/me
     `
    const result = extractURLs(text)

    expect(result).toEqual(['http://172.32.11.12:3000/api/v1/users/me'])
  })

  test('do not extracts url-like strings', () => {
    const text = `
      cfg.Host
      csv.Open
      csv.Read
      git@gitlab.samokat.io
      Image.open
      mailto:info@opk-buIat.ru
      Microsoft.ActiveDirectory.Management
      xw.Book
      tk.Tk
     `
    const result = extractURLs(text)

    expect(result).toEqual([])
  })
})
