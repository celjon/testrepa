import { Report } from '@prisma/client'
import { UseCaseParams } from '@/domain/usecase/types'

export type DeleteReport = (message_id: string) => Promise<Report | null | undefined>

export const buildDeleteReport = ({ adapter }: UseCaseParams): DeleteReport => {
  return async (message_id: string) => {
    const deletedReport = await adapter.messageRepository.deleteReport({
      where: {
        message_id: message_id
      }
    })
    return deletedReport
  }
}
