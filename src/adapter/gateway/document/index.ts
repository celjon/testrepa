import { buildToMarkdown, ToMarkdown } from './to-markdown'
import { buildDownloadPDFsAsMarkdown, DownloadPDFsAsMarkdown } from '@/adapter/gateway/document/download-pdfs-as-markdown'

export type DocumentGateway = {
  toMarkdown: ToMarkdown
  downloadPDFsAsMarkdown: DownloadPDFsAsMarkdown
}

export const buildDocumentGateway = (): DocumentGateway => {
  const toMarkdown = buildToMarkdown()
  const downloadPDFsAsMarkdown = buildDownloadPDFsAsMarkdown()

  return {
    toMarkdown,
    downloadPDFsAsMarkdown
  }
}
