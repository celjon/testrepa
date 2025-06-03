import { createClient } from 'redis'

export type Client = ReturnType<Awaited<typeof createClient>>

export interface RedisClients {
  main: ReturnType<Awaited<typeof createClient>>
  cancelFns: Record<string, () => void>
}

export const newClient = async (config: {
  host: string
  port: number
  user: string
  password: string
}): Promise<{ client: RedisClients }> => {
  const connectionUrl = `redis://${config.user}:${config.password}@${config.host}:${config.port}`

  const mainClient = createClient({ url: connectionUrl })
  await mainClient.connect()

  const promptQueueKeys = await mainClient.keys('promptQueues:*')
  if (promptQueueKeys.length > 0) {
    await mainClient.del(promptQueueKeys)
    console.log(`[redis] Old posts about the queues are deleted: ${promptQueueKeys.length} pcs`)
  }

  const pubSubClient = createClient({ url: connectionUrl })
  await pubSubClient.connect()

  const cancelFns: Record<string, () => void> = {}
  await pubSubClient.pSubscribe('promptQueueCancel:*', (message: string, channel: string) => {
    const parts = channel.split(':')
    const queueId = parts[1]
    const fn = cancelFns[queueId]
    if (fn) {
      try {
        fn()
      } catch (_) {
        //ignore
      }
      delete cancelFns[queueId]
    }
  })

  return {
    client: {
      main: mainClient,
      cancelFns
    }
  }
}
