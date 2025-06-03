import { Adapter } from '@/domain/types'
import { StrikeReason } from '@prisma/client'
import { SubscriptionService } from '../subscription'
import { ChatService } from '../chat'

type Params = Adapter & {
  subscriptionService: SubscriptionService
  chatService: ChatService
}

type ModerateParams = {
  imagePaths: Array<string>
  userId: string
  messageId?: string
}

export type VisionModerate = ({ imagePaths, userId, messageId }: ModerateParams) => Promise<{ flagged: boolean }>

export const buildVisionModerate = ({ strikeRepository, moderationGateway }: Params): VisionModerate => {
  return async ({ imagePaths, userId, messageId }) => {
    const { flagged } = await moderationGateway.visionModerate({
      images: imagePaths
    })

    if (flagged) {
      await strikeRepository.create({
        data: {
          user_id: userId,
          message_id: messageId,
          reason: StrikeReason.GPT_VISION_MODERATION
        }
      })
    }

    return { flagged }
  }
}
