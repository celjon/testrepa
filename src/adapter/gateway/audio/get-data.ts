import * as wav from 'node-wav'
import ffmpeg from 'fluent-ffmpeg'
import { PassThrough } from 'stream'
import { RawFile } from '@/domain/entity/file'
import ffmpegInstance from '@ffmpeg-installer/ffmpeg'
import { InvalidDataError } from '@/domain/errors'
import { AssemblyAiGateway } from '../assemblyAi'

ffmpeg.setFfmpegPath(ffmpegInstance.path)

export type GetData = (params: {
  file: RawFile
  assemblyAiGateway: AssemblyAiGateway
  waveSegments?: number
  temperature?: number
  prompt?: string
}) => Promise<{
  waveData: number[]
  duration: number
  content: string
}>

async function convertAnyToWav(inputBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const inputStream = new PassThrough()
    const outputStream = new PassThrough()
    const chunks: Buffer[] = []

    inputStream.end(inputBuffer)

    outputStream.on('data', (chunk: Buffer) => chunks.push(chunk))
    outputStream.on('end', () => resolve(Buffer.concat(chunks)))
    outputStream.on('error', (err: Error) => reject(err))

    ffmpeg(inputStream)
      .audioCodec('pcm_s16le')
      .audioFrequency(44100)
      .audioChannels(2)
      .format('wav')
      .outputOptions(['-ignore_unknown', '-fflags +genpts', '-strict experimental'])
      .on('error', (err: Error) => reject(err))
      .pipe(outputStream, { end: true })
  })
}

function fixWavHeader(buffer: Buffer): Buffer {
  const dataSize = buffer.length - 44
  const header = Buffer.alloc(44)

  header.write('RIFF', 0, 4, 'ascii')
  header.writeUInt32LE(buffer.length - 8, 4)
  header.write('WAVEfmt ', 8, 8, 'ascii')
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(2, 22)
  header.writeUInt32LE(44100, 24)
  header.writeUInt32LE(44100 * 4, 28)
  header.writeUInt16LE(4, 32)
  header.writeUInt16LE(16, 34)
  header.write('data', 36, 4, 'ascii')
  header.writeUInt32LE(dataSize, 40)

  buffer.set(header, 0)
  return buffer
}

export const buildGetData =
  (): GetData =>
  async ({ file, assemblyAiGateway, waveSegments = 30 }) => {
    const wavBuffer = await convertAnyToWav(file.buffer)

    const result = wav.decode(fixWavHeader(wavBuffer))

    if (!result || !result.channelData || result.channelData.length === 0) {
      throw new InvalidDataError({
        code: 'WAV_CONVERT_ERROR',
      })
    }

    const channelData = result.channelData[0]
    const segmentLength = Math.floor(channelData.length / waveSegments)

    if (segmentLength <= 0) {
      throw new Error(`Invalid segment length: ${segmentLength}`)
    }

    const duration = channelData.length / result.sampleRate
    const waveData: number[] = []

    let maxRMS = 0
    const rmsValues: number[] = []
    for (let index = 0; index < waveSegments; index++) {
      const start = index * segmentLength
      const end = start + segmentLength
      const segmentData = channelData.slice(start, end)

      if (segmentData.length === 0) {
        continue
      }

      const sumSquares = segmentData.reduce((sum, value) => sum + value * value, 0)
      const rms = Math.sqrt(sumSquares / segmentData.length)

      rmsValues.push(rms)
      maxRMS = Math.max(maxRMS, rms)
    }

    for (const rms of rmsValues) {
      const normalized = (rms / maxRMS) * 100
      waveData.push(Number(normalized.toFixed(2)))
    }
    const response = await assemblyAiGateway.transcribe({
      speech_model: 'best',
      audio: file.buffer,
      format_text: true,
      punctuate: true,
      language_detection: true,
    })

    return {
      waveData,
      duration,
      content: response.text ?? '',
    }
  }
