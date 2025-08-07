import { buildToMarkdown, ToMarkdown } from './to-markdown'
import { buildDownloadPDFsAsMarkdown, DownloadPDFsAsMarkdown } from './download-pdfs-as-markdown'
import { buildParseMdToDocxBlocks, ParseMdToDocxBlocks } from './parse-md-to-docx-blocks'

export type DocumentGateway = {
  toMarkdown: ToMarkdown
  downloadPDFsAsMarkdown: DownloadPDFsAsMarkdown
  parseMdToDocxBlocks: ParseMdToDocxBlocks
}

export const buildDocumentGateway = (): DocumentGateway => {
  const toMarkdown = buildToMarkdown()
  const downloadPDFsAsMarkdown = buildDownloadPDFsAsMarkdown()
  const parseMdToDocxBlocks = buildParseMdToDocxBlocks()

  return {
    toMarkdown,
    downloadPDFsAsMarkdown,
    parseMdToDocxBlocks,
  }
}
