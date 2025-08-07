import { AdapterParams } from '@/adapter/types'

export type SearchParams = {
  query: string
  numResults?: number
  skip?: number
  location?: string
  country?: string
  language?: string
}

export type GetGoogleScholarResultsWithPDF = (
  params: SearchParams,
  countPDF: number,
  skip?: number,
) => Promise<{
  results: {
    title: string
    snippet: string
    summary: string
    resources: string[]
  }[]
  skipped: number
}>
type Params = Pick<AdapterParams, 'serpApi'>

export const buildGetGoogleScholarResultsWithPDF = ({
  serpApi,
}: Params): GetGoogleScholarResultsWithPDF => {
  return async (
    { query, numResults = 10, skip = 0, location, country, language }: SearchParams,
    countPDF = 10,
  ) => {
    let resultsWithLinks: {
      title: string
      snippet: string
      summary: string
      resources: string[]
    }[] = []
    const seenLinks = new Set<string>()
    while (resultsWithLinks.length < countPDF) {
      const page = await serpApi.client.getGoogleScholarSearchResults({
        query,
        numResults,
        skip,
        location,
        country,
        language,
      })

      for (const item of page) {
        if (/^https:\/\/(.*\.)?books\.google\.com/.test(item.link)) {
          continue
        }
        const pdfLinks =
          item.resources
            ?.filter((resource) => resource.file_format === 'PDF' && !seenLinks.has(resource.link))
            .map((r) => r.link) ?? []

        if (pdfLinks.length) {
          pdfLinks.forEach((link) => seenLinks.add(link))
          resultsWithLinks.push({
            title: item.title,
            snippet: item.snippet,
            summary: item.publication_info.summary,
            resources: pdfLinks,
          })

          if (resultsWithLinks.length >= countPDF) break
        }
      }

      skip += numResults
      if (page.length < numResults) break
    }
    return {
      results: resultsWithLinks,
      skipped: skip,
    }
  }
}
