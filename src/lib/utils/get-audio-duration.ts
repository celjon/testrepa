import { parseStream } from 'music-metadata'
import { PassThrough, Readable } from 'stream'

export async function getAudioDuration(file: Readable): Promise<number> {
  const clone = new PassThrough()
  file.pipe(clone)

  const metadata = await parseStream(clone, undefined, { duration: true })
  return metadata.format.duration ?? 0
}
