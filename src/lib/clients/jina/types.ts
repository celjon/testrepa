import { MarkdownContent } from '@/adapter/gateway/webSearch'

export type JinaApiClient = {
  getMarkdownContent: (params: { url: string; signal?: AbortController }) => Promise<MarkdownContent>
}
