import { IModelAccountQueue } from '@/domain/entity/modelAccountQueue'
import { UseCaseParams } from '@/domain/usecase/types'
import { ModelAccountQueueType } from '@prisma/client'

export type CreateAccountQueue = (params: {
  name: string
  type: ModelAccountQueueType
  intervalTimeStart?: string
  intervalTimeEnd?: string
  providerId?: string
  disabled?: boolean
}) => Promise<IModelAccountQueue | null | never>

export const buildCreateAccountQueue =
  ({ adapter }: UseCaseParams): CreateAccountQueue =>
  async ({ name, type, intervalTimeStart, intervalTimeEnd, providerId, disabled }) => {
    const modelAccountQueue = await adapter.modelAccountQueueRepository.create({
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
