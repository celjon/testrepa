import { LoadingHandler } from './midjourney/src'

export interface MidjourneyAddAccountParams {
  id: string
  SalaiToken: string
  ServerId: string
  ChannelId: string
}

export interface MidjourneyRemoveAccountParams {
  id: string
}

export interface midjourneyApiAccount {
  add: (params: MidjourneyAddAccountParams) => Promise<void>
  remove: (params: MidjourneyRemoveAccountParams) => Promise<void>
}

export interface MidjourneyImagineParams {
  prompt: string
  callback?: LoadingHandler
}

export interface MidjourneyImagineResult {
  url: string
  proxy_url?: string
  content: string
  flags: number
  id?: string
  hash?: string
  progress?: string
  options?: MJOption[]
  width?: number
  height?: number
}

export interface MJOption {
  label: string
  type: number
  style: number
  custom: string
}

export interface MidjourneyDescribeParams {
  url: string
}

export interface MidjourneyDescribeResult {
  id: string
  flags: number
  url: string
  proxy_url?: string
  options: MJOption[]
  descriptions: string[]
}

export interface MidjourneyButtonParams {
  msgId: string
  customId: string
  content?: string
  flags?: number
  callback?: LoadingHandler
}

export interface MidjourneyButtonResult {
  url: string
  proxy_url?: string
  content: string
  flags: number
  id?: string
  hash?: string
  progress?: string
  options?: MJOption[]
  width?: number
  height?: number
}

export interface MidjourneyInfo {
  subscription: string
  jobMode: string
  visibilityMode: string
  fastTimeRemaining: string
  lifetimeUsage: string
  relaxedUsage: string
  queuedJobsFast: string
  queuedJobsRelax: string
  runningJobs: string
}

export interface MidjourneyApiClient {
  imagine: (params: MidjourneyImagineParams) => Promise<MidjourneyImagineResult | null>
  describe: (params: MidjourneyDescribeParams) => Promise<MidjourneyDescribeResult | null>
  buttonClick: (params: MidjourneyButtonParams) => Promise<MidjourneyButtonResult | null>
  info: () => Promise<any>
}

export interface MidjourneyApi {
  client: MidjourneyApiClient
}
