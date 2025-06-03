import { Adapter } from '@/domain/types'
import { StrikeReason } from '@prisma/client'
import { ForbiddenError } from '@/domain/errors'

type Params = Adapter

export type Moderate = (params: { messageId?: string; content: string; userId: string }) => Promise<unknown>

export const buildModerate =
  ({ openrouterGateway, strikeRepository }: Params): Moderate =>
  async ({ messageId, content, userId }) => {
    const { message } = await openrouterGateway
      .sync({
        settings: {
          model: 'openai/gpt-4o',
          temperature: 0
        },
        messages: [
          {
            role: 'user',
            content: `
            Some user wants to generate image from text $Prompt.
            If $Prompt violates $Rules write yes. Don't be too strict with the rules, allow for the gray area. Write only YES or NO. Don't give any explanations.

            $Prompt: ${content}

            $Rules:
            1. “Safe For Work” (SFW) content only
            1.1 Do not create or attempt to create gore or adult content. Avoid making visually shocking or disturbing content.
            1.2 What is Considered Gore? Gore includes images of detached body parts of humans or animals, cannibalism, blood, violence (images of shooting or bombing someone, for instance), mutilated bodies, severed limbs, pestilence, etc.
            1.3 What is NSFW or Adult Content? Avoid nudity, sexual organs, fixation on such things, sexualized imagery, fetishes, people in showers, on toilets, etc.
            1.4 Do not create or attempt to create content that in any way sexualizes children or minors. This includes real images as well as generated images. Do not generate, upload, share, or make attempts to distribute content that depicts, promotes, or attempts to normalize child sexual abuse.
            1.5 Do not create other offensive content. Other things may be deemed offensive or abusive because they can be viewed as racist, homophobic, disturbing, or in some way derogatory to a community. This includes offensive or inflammatory images of celebrities or public figures.
            2. Do not create images or use text prompts that are inherently disrespectful, aggressive, or otherwise abusive.
            3. Do not create or use imagery of real people, famous or otherwise, that could be used to harass, abuse, defame, or otherwise harm.
            4. Respect others’ rights. Do not attempt to find out others' private information. Do not upload others’ private information.
            5. Do not generate images for political campaigns or to try to influence the outcome of an election.
            6. Do not generate images to attempt to or to actually deceive or defraud anyone.
          `
          }
        ],
        endUserId: userId
      })
      .catch(() => ({ message: { content: 'YES' } }))

    if (!/YES/.test(message.content ?? '')) {
      return
    }

    await strikeRepository.create({
      data: {
        user_id: userId,
        message_id: messageId,
        ...(!messageId && { content }),
        reason: StrikeReason.MJ_MODERATION
      }
    })

    throw new ForbiddenError({
      code: 'VIOLATION'
    })
  }
