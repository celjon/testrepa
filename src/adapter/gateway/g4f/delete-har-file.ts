import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'g4f'>

export type DeleteHarFile = (params: {
  name: string
  apiUrl: string
  harManagerUrl: string
}) => Promise<unknown>

export const buildDeleteHarFile = ({ g4f }: Params): DeleteHarFile => {
  return async ({ name, apiUrl, harManagerUrl }) => {
    const g4fClient = g4f.client.create({
      apiUrl,
      harManagerUrl,
    })

    await g4fClient.deleteHARFile({
      name,
      apiUrl,
    })
  }
}
