import { AxiosInstance } from 'axios'

export interface TranscriptConfig {
  lang?: string
  axios: AxiosInstance
}

export interface TranscriptResponse {
  text: string
  duration: number
  offset: number
  lang?: string
}

export interface TranscriptAPI {
  fetchTranscript(videoId: string, config: TranscriptConfig): Promise<TranscriptResponse[]>
}
