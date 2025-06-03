import { config } from '@/config'
import { Adapter } from '@/domain/types'
import { SwitchNext } from './switchNext'

type Params = Pick<Adapter, 'modelAccountQueueRepository'> & {
  switchNext: SwitchNext
}

export type Balance = () => Promise<void>

export const buildBalance = ({ modelAccountQueueRepository, switchNext }: Params): Balance => {
  return async () => {
    const modelAccountQueues = await modelAccountQueueRepository.list({
      where: {
        provider: {
          id: config.model_providers.midjourney.id
        }
      },
      include: {
        accounts: true
      }
    })

    await Promise.all(
      modelAccountQueues.map(async (queue) => {
        if (queue.accounts && queue.accounts?.length < 1) return

        if (!queue.next_switch_time || new Date() >= new Date(queue.next_switch_time)) {
          await switchNext({ accountQueue: queue })
        }
      })
    )

    return
  }
}
