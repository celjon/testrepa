import { UseCaseParams } from '@/domain/usecase/types'

type AddReportInsertType = {
  user_id: string
  description: string
  message_id: string
}

export type CreateReport = (data: AddReportInsertType) => Promise<string>

export const buildCreateReport = ({ adapter }: UseCaseParams): CreateReport => {
  return async ({ user_id, description, message_id }) => {
    const message = await adapter.messageRepository.get({
      where: {
        id: message_id
      }
    })

    const report = await adapter.messageRepository.createReport({
      data: {
        user_id: user_id,
        description: description,
        message_id: message_id,
        chat_id: String(message?.chat_id)
      }
    })

    return report.message_id
  }
}
