import { StrikeReason } from '@prisma/client'
import { ForbiddenError } from '@/domain/errors'
import { Adapter } from '@/domain/types'
import { UserService } from '../user'

type Params = Adapter & {
  userService: UserService
}

type ModerateParams = {
  messageId?: string
  content: string
  userId: string
  contentCategory?: 'text' | 'presetName' | 'presetDescription' | 'presetSystemPrompt'
}

export type Moderate = ({
  messageId,
  content,
  userId,
  contentCategory,
}: ModerateParams) => Promise<void>

export const buildModerate =
  ({ strikeRepository, moderationGateway }: Params): Moderate =>
  async ({ messageId, content, userId, contentCategory = 'text' }) => {
    const moderationResult = await moderationGateway.moderate(content)

    if (moderationResult.flagged) {
      await strikeRepository.create({
        data: {
          user_id: userId,
          message_id: messageId,
          ...(!messageId && { content }),
          reason: StrikeReason.GPT_MODERATION,
        },
      })

      switch (contentCategory) {
        case 'presetName':
          throw new ForbiddenError({
            code: 'NAME_VIOLATION',
            message: moderationResult.reason,
          })
        case 'presetDescription':
          throw new ForbiddenError({
            code: 'DESC_VIOLATION',
            message: moderationResult.reason,
          })
        case 'presetSystemPrompt':
          throw new ForbiddenError({
            code: 'SYSTEM_PROMPT_VIOLATION',
            message: moderationResult.reason,
          })
        case 'text':
          throw new ForbiddenError({
            code: 'VIOLATION',
            message: moderationResult.reason,
          })
      }
    }
  }
