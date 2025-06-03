import { AdapterParams } from '@/adapter/types'
import { TranscribeParams, TranscriptParagraph } from 'assemblyai'

type Params = Pick<AdapterParams, 'assemblyAI'>

export type AssemblyAiGateway = ReturnType<typeof buildAssemblyAiGateway>

export const buildAssemblyAiGateway = ({ assemblyAI }: Params) => {
  return {
    transcribe: async (params: TranscribeParams) => {
      return assemblyAI.client.transcripts.transcribe(params)
    },
    getTranscribeParagraphs: async (transcript_id: string): Promise<TranscriptParagraph[]> => {
      const { paragraphs } = await assemblyAI.client.transcripts.paragraphs(transcript_id)
      return paragraphs
    }
  }
}
