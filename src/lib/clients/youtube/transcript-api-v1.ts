// https://github.com/Kakulukian/youtube-transcript/blob/master/src/index.ts
import axios, { AxiosInstance } from 'axios'
import {
  YoutubeTranscriptDisabledError,
  YoutubeTranscriptNotAvailableError,
  YoutubeTranscriptTooManyRequestError,
  YoutubeTranscriptVideoUnavailableError
} from './errors'
import { TranscriptAPI, TranscriptConfig, TranscriptResponse } from './transcript-api'

const RE_XML_TRANSCRIPT = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g

export class TranscriptAPIv1 implements TranscriptAPI {
  async fetchTranscript(videoId: string, config?: TranscriptConfig): Promise<TranscriptResponse[]> {
    const customAxios: AxiosInstance = config?.axios ?? axios
    const lang = config?.lang

    const response = await customAxios.get(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        ...(config?.lang && { 'Accept-Language': config.lang })
      }
    })
    const pageBody = response.data

    const splittedHTML = pageBody.split('"captions":')

    if (splittedHTML.length <= 1) {
      if (pageBody.includes('class="g-recaptcha"')) {
        throw new YoutubeTranscriptTooManyRequestError()
      }
      if (!pageBody.includes('"playabilityStatus":')) {
        throw new YoutubeTranscriptVideoUnavailableError(videoId)
      }
      throw new YoutubeTranscriptDisabledError(videoId)
    }

    const captions: {
      captionTracks: {
        baseUrl: string
        vssId: string
        languageCode: string
      }[]
    } = (() => {
      try {
        return JSON.parse(splittedHTML[1].split(',"videoDetails')[0].replace('\n', ''))
      } catch (e) {
        return undefined
      }
    })()?.['playerCaptionsTracklistRenderer']

    if (!captions) {
      throw new YoutubeTranscriptDisabledError(videoId)
    }

    if (!('captionTracks' in captions)) {
      throw new YoutubeTranscriptNotAvailableError(videoId)
    }

    const captionTrack =
      captions.captionTracks.find((track) => track.languageCode === lang) ??
      captions.captionTracks.find(
        (track) => track.vssId === `.${lang}` || track.vssId === `a.${lang}` || (track.vssId && track.vssId.match(`.${lang}`))
      ) ??
      captions.captionTracks[0]

    if (!captionTrack) {
      throw new YoutubeTranscriptNotAvailableError(videoId)
    }

    const transcriptResponse = await customAxios.get(captionTrack.baseUrl, {
      headers: {
        ...(config?.lang && { 'Accept-Language': config.lang })
      }
    })

    if (transcriptResponse.status !== 200) {
      throw new YoutubeTranscriptNotAvailableError(videoId)
    }

    const xml: string = transcriptResponse.data
    const results = [...xml.matchAll(RE_XML_TRANSCRIPT)]

    return results.map((result) => ({
      text: result[3],
      duration: parseFloat(result[2]),
      offset: parseFloat(result[1]),
      lang: captions.captionTracks[0].languageCode
    }))
  }
}
