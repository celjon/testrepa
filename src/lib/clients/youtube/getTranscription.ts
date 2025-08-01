import { AxiosInstance } from 'axios'
import { TranscriptAPIv1 } from './transcript-api-v1'
import { getYoutubeVideoId } from './getYoutubeVideoId'
import { YoutubeTranscriptNotAvailableError } from './errors'
import { logger } from '@/lib/logger'
import { getErrorString } from '@/lib/utils'

const buildTryGetTranscription = ({ customAxios }: { customAxios: AxiosInstance }) => {
  const transcriptAPIs = [new TranscriptAPIv1()]

  return async (videoId: string, lang?: string) => {
    for (const [idx, transcriptAPI] of transcriptAPIs.entries()) {
      try {
        const transcript = await transcriptAPI.fetchTranscript(videoId, {
          lang,
          axios: customAxios
        })

        return transcript
      } catch (e) {
        logger.error({
          message: `Failed to get transcript from Youtube Transcript API #${idx}: ${getErrorString(e)}`,
          location: 'tryGetTranscription'
        })
      }
    }

    throw new YoutubeTranscriptNotAvailableError('No transcript found')
  }
}

export type GetTranscription = (params: { url: string; lang?: string }) => Promise<string>

export const buildGetTranscription = ({ customAxios }: { customAxios: AxiosInstance }): GetTranscription => {
  const tryGetTranscription = buildTryGetTranscription({ customAxios })

  return async ({ url: videoURL, lang }) => {
    const videoId = getYoutubeVideoId(videoURL)
    const transcript = await tryGetTranscription(videoId, lang)

    return JSON.stringify(
      transcript.map((item) => ({
        text: item.text,
        time: `${Math.floor(item.offset / 60)}:${item.offset % 60}`
      }))
    )
  }
}
