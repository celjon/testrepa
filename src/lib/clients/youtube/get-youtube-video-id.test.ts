import { describe, expect, test } from 'vitest'
import { getYoutubeVideoId } from './get-youtube-video-id'

// https://gist.github.com/rodrigoborgesdeoliveira/987683cfbfcc8d800192da1e73adc486 youtube video url formats
describe('getYoutubeVideoId', () => {
  test('standard url', () => {
    const videoURL = 'https://www.youtube.com/watch?v=qcC_DGkFRSA'
    const result = getYoutubeVideoId(videoURL)

    expect(result).toBe('qcC_DGkFRSA')
  })

  test('standard url with query params', () => {
    const videoURL =
      'https://www.youtube.com/watch?v=qcC_DGkFRSA&list=PL7y-1kgxy-f3f-3i9-8-7-6-5-4-3-2-1-0'
    const result = getYoutubeVideoId(videoURL)

    expect(result).toBe('qcC_DGkFRSA')
  })

  test('standard url with query params and hash', () => {
    const videoURL =
      'https://www.youtube.com/watch?v=qcC_DGkFRSA&list=PL7y-1kgxy-f3f-3i9-8-7-6-5-4-3-2-1-0#t=0m0s'
    const result = getYoutubeVideoId(videoURL)

    expect(result).toBe('qcC_DGkFRSA')
  })

  test('short url', () => {
    const videoURL = 'https://youtu.be/qcC_DGkFRSA'
    const result = getYoutubeVideoId(videoURL)

    expect(result).toBe('qcC_DGkFRSA')
  })

  test('mobile url', () => {
    const videoURL = 'https://m.youtube.com/watch?v=-wtIMTCHWuI'
    const result = getYoutubeVideoId(videoURL)

    expect(result).toBe('-wtIMTCHWuI')
  })

  test('mobile url', () => {
    const videoURL = 'https://m.youtube.com/watch/-wtIMTCHWuI'
    const result = getYoutubeVideoId(videoURL)

    expect(result).toBe('-wtIMTCHWuI')
  })

  test('mobile url with query params', () => {
    const videoURL = 'https://m.youtube.com/watch/-wtIMTCHWuI?app=desktop'
    const result = getYoutubeVideoId(videoURL)

    expect(result).toBe('-wtIMTCHWuI')
  })

  test('mobile url', () => {
    const videoURL = 'https://m.youtube.com/v/dQw4w9WgXcQ'
    const result = getYoutubeVideoId(videoURL)

    expect(result).toBe('dQw4w9WgXcQ')
  })

  test('short url', () => {
    const videoURL = 'https:///youtu.be/lalOy8Mbfdc?t=1'
    const result = getYoutubeVideoId(videoURL)

    expect(result).toBe('lalOy8Mbfdc')
  })

  test('embedded url', () => {
    const videoURL = 'https:///www.youtube.com/embed/lalOy8Mbfdc'
    const result = getYoutubeVideoId(videoURL)

    expect(result).toBe('lalOy8Mbfdc')
  })

  test('embedded url', () => {
    const videoURL = 'https://m.youtube.com/e/dQw4w9WgXcQ'
    const result = getYoutubeVideoId(videoURL)

    expect(result).toBe('dQw4w9WgXcQ')
  })
})
