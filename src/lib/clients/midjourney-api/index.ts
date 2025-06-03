import { Midjourney } from './midjourney/src'
import { MidjourneyApi, MidjourneyApiClient } from './types'

type Params = {
  SalaiToken: string
  ServerId: string
  ChannelId: string
}

export const newMidjourneyApi = (config: Params): MidjourneyApi => {
  const client: MidjourneyApiClient = {
    imagine: async ({ prompt, callback }) => {
      const midjourney = new Midjourney(config)

      const result = await midjourney.Imagine(prompt, callback)

      midjourney.Close()

      return result
    },
    describe: async ({ url }) => {
      const midjourney = new Midjourney(config)

      const result = await midjourney.Describe(url)

      midjourney.Close()

      return result
    },
    buttonClick: async ({ msgId, customId, content, flags = 0, callback }) => {
      const midjourney = new Midjourney(config)

      const result = await midjourney.Custom({
        msgId,
        customId,
        content,
        flags,
        loading: callback
      })

      midjourney.Close()

      return result
    },
    info: async () => {}
  }

  return {
    client
  }
}

export * from './types'
