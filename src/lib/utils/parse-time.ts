export function parseTimeMs(time: string): number {
  const timeRegex = /^(\d{2}):(\d{2}):(\d{2})$/
  const match = time.match(timeRegex)

  if (!match) {
    return 0
  }

  const hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const seconds = parseInt(match[3], 10)

  const milliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000

  return milliseconds
}
