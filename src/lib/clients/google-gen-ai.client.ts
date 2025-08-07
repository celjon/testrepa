import { GoogleGenAI } from '@google/genai'

export interface GoogleGenAiClientConfig {
  project: string
  keyFileJson: string
  location: string
}

export type GoogleGenAiClient = {
  client: GoogleGenAI
}

export const newClient = (config: GoogleGenAiClientConfig): GoogleGenAiClient => {
  const credentials = JSON.parse(config.keyFileJson)

  const googleGenAI = new GoogleGenAI({
    vertexai: true,
    project: config.project,
    location: config.location,
    googleAuthOptions: { credentials },
  })
  return { client: googleGenAI }
}
