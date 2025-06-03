interface MJOption {
  type: number
  style: number
  label: string
  custom: string
}

export type MJUpdateEvent = {
  name: 'MESSAGE_UPDATE'
  data: {
    progress: string
    url: string
  }
}

export interface MJDoneEvent {
  name: 'MESSAGE_DONE'
  data: {
    id: string
    flags: number
    content: string
    hash: string
    progress: string
    uri: string
    proxy_url: string
    options: MJOption[]
    width: number
    height: number
  }
}

export type MJEvent = MJUpdateEvent | MJDoneEvent
