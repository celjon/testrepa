import OpenAi from 'openai'

export const newClient = (openAiKey: string) => {
  const client = new OpenAi({
    apiKey: openAiKey,
  })

  return {
    client,
  }
}

export interface IOpenAIModel {
  id: string
  created: number
  object: 'model'
  owned_by: string
}
