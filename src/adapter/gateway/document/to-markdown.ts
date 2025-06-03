import mammoth from 'mammoth'
import TurndownService from 'turndown'
import iconv from 'iconv-lite'
import mime from 'mime-types'
import { stripNullCharacters } from '@/lib'
import pdf from 'pdf-parse'
import * as XLSX from 'xlsx'

function extractTextFromExcel(buffer: Buffer): string {
  const wb = XLSX.read(buffer, {
    type: 'buffer',
    cellFormula: false,
    cellStyles: false,
    cellHTML: false
  })

  if (!wb.SheetNames.length) return 'No sheets found in the workbook'

  const results: string[] = []

  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName]
    if (!sheet || !sheet['!ref']) {
      results.push(`Sheet ${sheetName}:\nEmpty sheet`)
      continue
    }

    const range = XLSX.utils.decode_range(sheet['!ref'])

    const usedCols = new Set<number>()
    //                  row            col     data
    const cells: Record<number, Record<number, string>> = {}

    for (const address in sheet) {
      if (address[0] === '!') continue // Skip metadata

      const cell: XLSX.CellObject = sheet[address]
      if (cell.v == null || cell.v === undefined) continue // Skip empty cells

      const cellRef = XLSX.utils.decode_cell(address)
      usedCols.add(cellRef.c)

      if (!cells[cellRef.r]) {
        cells[cellRef.r] = {}
      }

      // escape markdown specific characters
      cells[cellRef.r][cellRef.c] = String(cell.v).replace(/\|/g, '\\|').replace(/\n/g, ' ')
    }

    // Get sorted list of all columns that have any data
    const dataCols = Array.from(usedCols).sort((a, b) => a - b)

    if (dataCols.length === 0) {
      results.push(`Sheet ${sheetName}:\nNo data found`)
      continue
    }

    let md = ''

    // Process all rows without distinguishing headers
    for (let r = range.s.r; r <= range.e.r; r++) {
      const rowData = cells[r]
      if (!rowData) continue // Skip empty rows

      // Find the last non-empty cell in this row
      let lastNonEmptyIdx = -1
      for (let i = 0; i < dataCols.length; i++) {
        const value = rowData[dataCols[i]]
        if (value && value.trim() !== '') {
          lastNonEmptyIdx = i
        }
      }

      // Skip entirely empty rows
      if (lastNonEmptyIdx === -1) continue

      // Include columns up to the last non-empty cell
      const rowCols = dataCols.slice(0, lastNonEmptyIdx + 1)
      const rowValues = rowCols.map((c) => rowData[c] || '')

      md += '|' + rowValues.join('|') + '|\n'
    }

    results.push(`Sheet ${sheetName}:\n${md}`)
  }

  return results.join('\n\n')
}

const extractTextFromPDF = async (buffer: Buffer) => {
  const { text } = await pdf(buffer)
  return turndownService.turndown(text)
}

const turndownService = new TurndownService()

export type ToMarkdown = (params: {
  type: 'text' | 'word' | 'excel' | 'pdf'
  buffer: Buffer
  convertImage?: (buffer: Buffer, ext: string) => Promise<string>
}) => Promise<string>

export const buildToMarkdown =
  (): ToMarkdown =>
  async ({ type, buffer, convertImage }) => {
    if (type === 'word') {
      const { value } = await mammoth.convertToHtml(
        {
          buffer
        },
        {
          convertImage: mammoth.images.imgElement(async (element) => {
            const buffer = await element.read()
            const ext = `.${mime.extension(element.contentType)}`

            return {
              src: 'unknown',
              ...(convertImage && {
                src: await convertImage(buffer, ext)
              })
            }
          })
        }
      )

      return turndownService.turndown(value)
    } else if (type === 'excel') {
      return extractTextFromExcel(buffer)
    } else if (type === 'pdf') {
      return extractTextFromPDF(buffer)
    }

    return stripNullCharacters(iconv.decode(buffer, 'utf8'))
  }
