import { arrayGcd } from '@/lib'
import { newClient } from './openai.client'

export type GptKeys = Record<string, number>

export const buildBalancer = (gptKeys: GptKeys) => {
  let index = -1
  let quantum = 0

  const step = arrayGcd(Object.values(gptKeys))

  const len = Object.keys(gptKeys).length

  const gptKeysWithClients = Object.entries(gptKeys).map((key) => {
    return {
      key: key[0],
      weight: key[1],
      client: newClient(key[0])
    }
  })

  const maxWeight = gptKeysWithClients.sort((a, b) => b.weight - a.weight)[0].weight

  const next = () => {
    while (true) {
      index = (index + 1) % len
      if (index == 0) {
        quantum -= step
        if (quantum <= 0) {
          quantum = maxWeight
        }
      }

      if (gptKeysWithClients[index].weight >= quantum) {
        return gptKeysWithClients[index].client
      }
    }
  }

  return {
    next
  }
}
