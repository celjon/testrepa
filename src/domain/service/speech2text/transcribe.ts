import { RawFile } from '@/domain/entity/file'
import { Adapter } from '@/domain/types'
import { Readable } from 'stream'
import { Format } from './format'
import { InvalidDataError } from '@/domain/errors'

type Params = Adapter & {
  format: Format
}

export type TranscribeConfig = {
  model_id: string
  mediaFile: RawFile | null
  prompt?: string
  speaker_labels?: boolean
  format_text?: boolean
  temperature?: number
}

export type Transcribe = (params: { config: TranscribeConfig }) => Promise<{
  result: string
  duration: number
}>

export const buildTranscribe =
  ({ openaiGateway, assemblyAiGateway, format }: Params): Transcribe =>
  async ({ config }) => {
    const { temperature, format_text, speaker_labels, prompt, mediaFile, model_id } = config
    let formattedText = ''
    let duration = 0
    if (model_id.match(/^whisper/)) {
      const mediaFileReadable = new Readable()
      mediaFileReadable.push(mediaFile!.buffer)
      mediaFileReadable.push(null)
      const data = await openaiGateway.raw.transcriptions.create({
        model: 'whisper-1',
        file: mediaFileReadable,
        fileName: mediaFile!.originalname,
        temperature,
        prompt
      })
      formattedText = await format({ content: data.response.text }) ?? data.response.text
      if (data.audioMetadata.duration) {
        duration = data.audioMetadata.duration
      }
    } else if(model_id.match(/^assembly/)) {
      const transcript = await assemblyAiGateway.transcribe({
        speech_model: model_id.split('-').pop() === 'nano' ? 'nano' : 'best' ,
        audio: mediaFile?.buffer!,
        format_text,
        punctuate: true,
        speaker_labels,
        language_detection: true,
        auto_chapters: format_text
      })
      if(!transcript.text) {
        throw new InvalidDataError({
          message: 'Audio is empty or invalid',
          code: 'TRANSCRIPTION_ERROR'
        })
      }
      const paragraphs = await assemblyAiGateway.getTranscribeParagraphs(transcript.id)

      if (transcript.utterances && transcript.utterances.length > 0) {
        const speakerCount = new Set(transcript.utterances.map((u) => u.speaker)).size

        if (speakerCount > 1) {
          for (const utterance of transcript.utterances) {
            const speakerLabel = `Спикер ${utterance.speaker}:  `
            formattedText += `${speakerLabel}${utterance.text}\n\n`
          }
        } else {
          for (const paragraph of paragraphs) {
            formattedText += `${paragraph.text}\n`
          }
        }
      } else {
        for (const paragraph of paragraphs) {
          formattedText += `${paragraph.text}\n`
        }
      }
      if (transcript.audio_duration) {
        duration = transcript.audio_duration
      }
    }
    return {
      result: formattedText,
      duration
    }
  }
