import { UserService } from '../user'
import { buildModerate, Moderate } from './moderate'
import { Adapter } from '../../types'
import { buildVisionModerate, VisionModerate } from './visionModerate'
import { SubscriptionService } from '../subscription'
import { ChatService } from '../chat'

type Params = Adapter & {
  userService: UserService
  subscriptionService: SubscriptionService
  chatService: ChatService
}

export type ModerationService = {
  moderate: Moderate
  visionModerate: VisionModerate
}

export const buildModerationService = (params: Params): ModerationService => {
  const moderate = buildModerate(params)
  const visionModerate = buildVisionModerate(params)

  return {
    moderate,
    visionModerate
  }
}
