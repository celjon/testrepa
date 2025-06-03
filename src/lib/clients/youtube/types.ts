export type YoutubeDataClient = {
  getTranscription: (params: { url: string; lang?: string }) => Promise<string>
}
