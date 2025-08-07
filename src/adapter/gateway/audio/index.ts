import { buildGetData, GetData } from './get-data'

export type MediaGateway = {
  getData: GetData
}

export const buildMediaGateway = (): MediaGateway => {
  const getData = buildGetData()

  return {
    getData,
  }
}
