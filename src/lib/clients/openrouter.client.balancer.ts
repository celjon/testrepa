import { arrayGcd } from '@/lib'
import { newClient } from './openrouter'

type Params = {
  apiUrl: string
  keys: Record<string, number>
}

export const buildBalancer = ({ apiUrl, keys }: Params) => {
  let index = -1
  let quantum = 0
  const step = arrayGcd(Object.values(keys))
  const len = Object.keys(keys).length

  const keysWithClients = Object.entries(keys).map((key) => {
    return {
      key: key[0],
      weight: key[1],
      client: newClient({
        key: key[0],
        apiUrl
      })
    }
  })
  const maxWeight = keysWithClients.sort((a, b) => b.weight - a.weight)[0].weight

  const next = () => {
    while (true) {
      index = (index + 1) % len
      if (index == 0) {
        quantum -= step
        if (quantum <= 0) {
          quantum = maxWeight
        }
      }

      if (keysWithClients[index].weight >= quantum) {
        return keysWithClients[index].client
      }
    }
  }

  return {
    next
  }
}
