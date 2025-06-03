import { Adapter } from '../../types'
import { buildFormat, Format } from './format'
import { buildTranscribe, Transcribe } from './transcribe'

type Params = Adapter

export type Speech2TextService = {
  format: Format
  transcribe: Transcribe
}

export const buildSpeech2TextService = (params: Params): Speech2TextService => {
  const format = buildFormat(params)
  const transcribe = buildTranscribe({...params, format})

  return {
    format,
    transcribe
  }
}
