import OpenAI from 'openai'

export interface IOpenRouterModel {
  id: string
  name: string
  created: number
  description: string
  pricing: {
    prompt: string
    completion: string
    image: string
    request: string
  }
  context_length: number
  architecture: {
    modality: string
    tokenizer: string
    instruct_type: string
  }
  top_provider: {
    max_completion_tokens: number
    is_moderated: boolean
  }
  per_request_limits: null
}
export type DataPolicy = {
  termsOfServiceURL?: string
  privacyPolicyURL?: string
  training: boolean
}

export type ProviderInfo = {
  name: string
  displayName: string
  baseUrl: string
  dataPolicy: DataPolicy
  hasChatCompletions: boolean
  hasCompletions: boolean
  isAbortable: boolean
  moderationRequired: boolean
  group: string
  editors: any[]
  owners: any[]
  isMultipartSupported: boolean
  statusPageUrl?: string | null
  byokEnabled: boolean
  isPrimaryProvider: boolean
  icon: { url: string; invertRequired?: boolean }
}

export type ModelStats = {
  endpoint_id: string
  p50_throughput: number
  p50_latency: number
  request_count: number
}

export type ModelDetails = {
  slug: string
  hf_slug: string
  updated_at: string
  created_at: string
  hf_updated_at?: any
  name: string
  short_name: string
  author: string
  description: string
  model_version_group_id: string
  context_length: number
  modality: string
  has_text_output: boolean
  group: string
  instruct_type?: any
  default_system?: any
  default_stops: any[]
  hidden: boolean
  router?: any
  warning_message?: any
  permaslug: string
}

export type Pricing = {
  prompt: string
  completion: string
  image: string
  request: string
}

export type OpenRouterModelWithEndpoints = {
  id: string
  name: string
  context_length: number
  model: ModelDetails
  model_variant_slug: string
  model_variant_permaslug: string
  provider_name: string
  provider_info: ProviderInfo
  provider_display_name: string
  provider_model_id: string
  is_cloaked: boolean
  quantization?: string
  variant: string
  is_self_hosted: boolean
  can_abort: boolean
  max_prompt_tokens?: any
  max_completion_tokens?: any
  supported_parameters: string[]
  is_byok_required: boolean
  moderation_required: boolean
  data_policy: DataPolicy
  pricing: Pricing
  is_hidden: boolean
  is_deranked: boolean
  is_disabled: boolean
  supports_tool_parameters: boolean
  supports_reasoning: boolean
  supports_multipart: boolean
  limit_rpm?: number | null
  limit_rpd?: number | null
  has_completions: boolean
  has_chat_completions: boolean
  stats?: ModelStats
  status?: number
}

export type OpenRouterClient = OpenAI & {
  getModels: () => Promise<IOpenRouterModel[]>
  getModelProviders: (author: string, slug: string) => Promise<OpenRouterModelWithEndpoints[]>
}
