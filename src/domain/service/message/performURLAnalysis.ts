import { logger } from '@/lib/logger'
import { Adapter } from '../../types'
import { extractURLs, isYoutubeVideoURL, withTimeout } from '@/lib'
import { config } from '@/config'
import { CAPS_PER_1M_CONTENT_TOKENS } from '@/domain/service/ai-tools/web-search'

export type PerformURLAnalysis = (prompt: string) => Promise<{
  analysisResult: string
  caps: number
}>

// the thing that buildPerformURLAnalysis is called in multiple concurrent calls across multiple web workers is not considered yet
const MAX_CONCURRENT_YOUTUBE_REQUESTS = 10
// jina has 1000 rpm = 3.33 rps
const MAX_CONCURRENT_URL_REQUESTS = 3

const batchProcessor = async <T>(items: T[], batchSize: number, processItem: (item: T) => Promise<void>) => {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    await Promise.allSettled(batch.map(processItem))
  }
}

export const buildPerformURLAnalysis = ({ webSearchGateway, youtubeDataGateway }: Adapter): PerformURLAnalysis => {
  return async (prompt) => {
    const urls = extractURLs(prompt)
    const youtubeURLs = urls.filter(isYoutubeVideoURL)
    const otherURLs = urls.filter((url) => !isYoutubeVideoURL(url))

    const signal = new AbortController()
    let analysisResult = ''
    let analyzedURLs = 0
    let caps = 0

    const processYoutubeURLs = () =>
      batchProcessor(youtubeURLs, MAX_CONCURRENT_YOUTUBE_REQUESTS, async (url) => {
        try {
          const transcript = await youtubeDataGateway.getTranscription({
            url
          })
          analysisResult += `\n\nSTART_OF_TRANSCRIPT url: ${url}\n${transcript}\nEND_OF_TRANSCRIPT\n\n`
          analyzedURLs++
        } catch (e) {
          logger.error(`Failed to get video transcript for url ${url}: ${e}`)
          analysisResult += `\n\n(failed to get transcripts for video: ${url})\n\n`
        }
      })

    const processOtherURLs = () =>
      batchProcessor(otherURLs, MAX_CONCURRENT_URL_REQUESTS, async (url) => {
        try {
          const { content, tokens } = await webSearchGateway.getMarkdownContent({
            url,
            signal
          })
          analysisResult += `\n\n${content}`
          analyzedURLs++
          caps += (tokens / 1_000_000) * CAPS_PER_1M_CONTENT_TOKENS
        } catch (e) {
          logger.error(`Failed to get markdown content for url ${url}: ${e}`)
          analysisResult += `\n\n(failed to get content for url: ${url})`
        }
      })

    try {
      await withTimeout(Promise.allSettled([processYoutubeURLs(), processOtherURLs()]), config.timeouts.url_reader)
    } catch (e) {
      logger.error(`Failed to perform url analysis: ${e}`)
      signal.abort()
      analysisResult += '(failed to perform url analysis for all urls.)'

      if (e instanceof Error) {
        analysisResult += ` ${e?.message ? e?.message : ''}`
      }
    }

    if (analysisResult.trim().length > 0) {
      analysisResult +=
        '\nIf errors occur, notify user. Use proper language. Advise disabling URL-Analysis in chat settings if function unrequested. List problematic URLs and errors at response end. If everything is ok, do not mention it.'
    }

    if (analyzedURLs > 0) {
      logger.info(`Successfully analyzed ${analyzedURLs}/${urls.length} URLs`)
    }

    return {
      analysisResult,
      caps
    }
  }
}
