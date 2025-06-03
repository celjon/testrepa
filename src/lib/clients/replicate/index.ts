import Replicate from 'replicate'

type Params = {
  apiKey: string
}

export const newClient = ({ apiKey }: Params): { client: Replicate } => {
  const replicate = new Replicate({
    auth: apiKey
  })

  return {
    client: replicate
  }
}

export * from './types'
