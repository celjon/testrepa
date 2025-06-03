import { AdapterParams } from '@/adapter/types'
import { buildSend, Send } from './send'

type Params = Pick<AdapterParams, 'openaiBalancer'>

export type SpeechGateway = {
  send: Send
}

export const buildSpeechGateway = (params: Params): SpeechGateway => {
  const send = buildSend(params)

  return {
    send
  }
}
