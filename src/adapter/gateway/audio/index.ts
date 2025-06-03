import { buildGetData, GetData } from './getData'

export type MediaGateway = {
  getData: GetData
}

export const buildMediaGateway = (): MediaGateway => {
  const getData = buildGetData()

  return {
    getData
  }
}
