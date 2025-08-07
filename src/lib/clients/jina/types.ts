import { MarkdownContent } from 'adapter/gateway/web-search'

export type JinaApiClient = {
  getMarkdownContent: (params: {
    url: string
    signal?: AbortController
  }) => Promise<MarkdownContent>
}
