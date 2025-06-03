import { Report } from '@prisma/client'
import { UseCaseParams } from '@/domain/usecase/types'

export type ListReport = (message_id: string) => Promise<Report[] | null | undefined>

export const buildListReport = ({ adapter }: UseCaseParams): ListReport => {
  return async (chat_id: string) => {
    const listedReports = await adapter.messageRepository.listReport({
      where: {
        chat_id: chat_id
      }
    })
    return listedReports
  }
}
