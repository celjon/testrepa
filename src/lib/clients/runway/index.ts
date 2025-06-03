import RunwayML from '@runwayml/sdk'

type Params = {
  apiKey: string
}

export const newClient = ({ apiKey }: Params): { client: RunwayML } => {
  const client = new RunwayML({
    apiKey: apiKey
  })

  return {
    client
  }
}
