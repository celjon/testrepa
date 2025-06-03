import { IModelAccountQueue } from '@/domain/entity/modelAccountQueue'
import { UseCaseParams } from '@/domain/usecase/types'
import { ModelAccountQueueType } from '@prisma/client'

export type UpdateAccountQueue = (params: {
  id: string
  name?: string
  type?: ModelAccountQueueType
  intervalTimeStart?: string
  intervalTimeEnd?: string
  providerId?: string
  disabled?: boolean
}) => Promise<IModelAccountQueue | null | never>

export const buildUpdateAccountQueue =
  ({ adapter }: UseCaseParams): UpdateAccountQueue =>
  async ({ id, name, type, intervalTimeStart, intervalTimeEnd, providerId, disabled }) => {
    const modelAccountQueue = await adapter.modelAccountQueueRepository.update({
      where: { id },
      data: {
        name,
        type,
        interval_time_start: intervalTimeStart,
        interval_time_end: intervalTimeEnd,
        ...(providerId && {
          provider: {
            connect: {
              id: providerId
            }
          }
        }),
        disabled
      },
      include: {
        provider: {
          include: {
            parent: {
              select: {
                id: true,
                label: true,
                name: true
              }
            }
          }
        }
      }
    })

    return modelAccountQueue
  }
