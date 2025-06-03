import OpenAI from 'openai'

export type G4FClient = OpenAI & {
  getModels: () => Promise<string[]>
  getProviders: () => Promise<Record<string, string>>
  getHarFiles: () => Promise<string[]>
  readHarFile: (name: string) => Promise<Buffer>
  writeHarFile: (name: string, data: Buffer) => Promise<void>
  deleteHarFile: (name: string) => Promise<void>
}
