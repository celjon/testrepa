import { buildOnMessage, OnMessage } from './on-message'
import { buildSend, Send } from './send'
import { buildEmit, Emit } from './emit'
import { buildOn, On } from './on'
import { buildGetWorkers, GetWorkers } from './get-workers'

export type ClusterGateway = {
  send: Send
  onMessage: OnMessage
  emit: Emit
  on: On
  getWorkers: GetWorkers
}

export const buildClusterGateway = () => {
  const send = buildSend()
  const onMessage = buildOnMessage()
  const emit = buildEmit({ send })
  const on = buildOn({ onMessage })
  const getWorkers = buildGetWorkers()

  return {
    send,
    onMessage,
    emit,
    on,
    getWorkers,
  }
}
