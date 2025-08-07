import { MidjourneyApi, midjourneyApiAccount, newMidjourneyApi } from './midjourney-api'

export const buildBalancer = () => {
  const clients: Map<string, MidjourneyApi> = new Map()

  const account: midjourneyApiAccount = {
    add: async (account) => {
      clients.set(account.id, newMidjourneyApi(account))
    },
    remove: async ({ id }) => {
      clients.delete(id)
    },
  }

  const findById = (id: string) => clients.get(id)?.client

  return {
    account,
    findById,
  }
}
