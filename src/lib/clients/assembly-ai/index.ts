import { AssemblyAI } from 'assemblyai'

type Params = {
  apiKey: string
}

export const newClient = ({ apiKey }: Params): {client: AssemblyAI} => {
  const client = new AssemblyAI({
    apiKey: apiKey
  })

  return {
    client
  }
}
