import { YoutubeTranscriptError } from './errors'

const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|m\.youtube\.com\/watch\?v=|m\.youtube\.com\/watch\/)([^"&?/\s]{11})/i

export function getYoutubeVideoId(videoId: string) {
  if (videoId.length === 11) {
    return videoId
  }
  const matchId = videoId.match(YOUTUBE_REGEX)
  if (matchId && matchId.length) {
    return matchId[1]
  }

  throw new YoutubeTranscriptError('Impossible to retrieve Youtube video ID.')
}

export const isYoutubeVideoURL = (url: string): boolean => {
  return YOUTUBE_REGEX.test(url)
}
