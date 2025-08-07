import { AxiosInstance } from 'axios'
import {
  YoutubeTranscriptDisabledError,
  YoutubeTranscriptNotAvailableError,
  YoutubeTranscriptTooManyRequestError,
  YoutubeTranscriptVideoUnavailableError,
} from './errors'
import { TranscriptAPI, TranscriptConfig, TranscriptResponse } from './transcript-api'

type CaptionTrack = {
  baseUrl: string
  languageCode: string
  kind?: 'asr'
  name: { runs: { text: string }[] }
}

export class TranscriptAPIv2 implements TranscriptAPI {
  async fetchTranscript(videoId: string, config: TranscriptConfig): Promise<TranscriptResponse[]> {
    try {
      const http = config.axios

      const { data: html } = await http.get(`https://www.youtube.com/watch?v=${videoId}`)

      const match = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)
      const apiKey = match ? match[1] : null
      if (!apiKey) {
        throw new YoutubeTranscriptVideoUnavailableError('Could not extract API key')
      }

      const { data: playerData } = await this.fetchPlayerData(http, videoId, apiKey)

      const tracks = playerData.captions?.playerCaptionsTracklistRenderer?.captionTracks

      if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
        throw new YoutubeTranscriptDisabledError('No captions available for this video')
      }

      const selectedTrack = this.selectTrack(tracks, config?.lang)

      let captionUrl = selectedTrack.baseUrl.replace('&fmt=srv3', '')
      const { data: xml } = await http.get(captionUrl, { responseType: 'text' })

      const entries = this.parseTranscriptXml(xml)

      return entries.map((entry) => ({
        text: entry.text,
        duration: entry.duration,
        offset: entry.start,
        lang: selectedTrack.languageCode,
      }))
    } catch (error) {
      this.handleError(error, videoId)
    }
  }

  private async fetchPlayerData(http: AxiosInstance, videoId: string, apiKey: string) {
    const url = `https://www.youtube.com/youtubei/v1/player?key=${apiKey}`

    return http.post(
      url,
      {
        context: {
          client: {
            clientName: 'WEB',
            clientVersion: '2.20231219.04.00',
            hl: 'en',
            gl: 'US',
            userAgent:
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36,gzip(gfe)',
            browserName: 'Chrome',
            browserVersion: '120.0.0.0',
            osName: 'Windows',
            osVersion: '10.0',
            platform: 'DESKTOP',
          },
        },
        videoId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-YouTube-Client-Name': '1',
          'X-YouTube-Client-Version': '2.20231219.04.00',
          Origin: 'https://www.youtube.com',
          Referer: `https://www.youtube.com/watch?v=${videoId}`,
        },
      },
    )
  }

  private selectTrack(tracks: CaptionTrack[], preferredLang?: string): CaptionTrack {
    if (preferredLang) {
      // First try manual transcripts
      const manualTrack = tracks.find((t) => t.languageCode === preferredLang && !t.kind)
      if (manualTrack) {
        return manualTrack
      }

      // Then try auto-generated
      const autoTrack = tracks.find((t) => t.languageCode === preferredLang && t.kind === 'asr')
      if (autoTrack) {
        return autoTrack
      }

      // Try partial match
      const partialTrack = tracks.find((t) => t.languageCode.startsWith(preferredLang))
      if (partialTrack) {
        return partialTrack
      }

      return tracks[0]
    }

    const manualTrack = tracks.find((t) => !t.kind)
    if (manualTrack) {
      return manualTrack
    }

    return tracks[0]
  }

  private parseTranscriptXml(
    xmlData: string,
  ): Array<{ text: string; start: number; duration: number }> {
    const textElements = xmlData.match(/<text[^>]*>.*?<\/text>/g) || []

    return textElements
      .map((element) => {
        const startMatch = element.match(/start="([^"]*)"/)
        const durMatch = element.match(/dur="([^"]*)"/)

        const textMatch = element.match(/<text[^>]*>(.*?)<\/text>/)
        const text = textMatch ? textMatch[1] : ''

        return {
          text: this.unescapeHtml(text).replace(/<[^>]*>/g, ''), // Remove HTML tags
          start: parseFloat(startMatch ? startMatch[1] : '0'),
          duration: parseFloat(durMatch ? durMatch[1] : '0'),
        }
      })
      .filter((snippet) => snippet.text.trim())
  }

  private unescapeHtml(text: string): string {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
  }

  private handleError(error: any, videoId: string): never {
    if (error.response) {
      const status = error.response.status

      if (status === 429) {
        throw new YoutubeTranscriptTooManyRequestError()
      }

      if (status === 404) {
        throw new YoutubeTranscriptVideoUnavailableError(`Video not found: ${videoId}`)
      }

      if (status >= 400 && status < 500) {
        throw new YoutubeTranscriptVideoUnavailableError(`Video unavailable: ${videoId}`)
      }
    }

    if (error.message.includes('No captions')) {
      throw new YoutubeTranscriptDisabledError(error.message)
    }

    if (error.message.includes('No transcript available')) {
      throw new YoutubeTranscriptNotAvailableError(error.message)
    }

    throw error
  }
}
