import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'
import { StrikeReason } from '@prisma/client'
import { getErrorString } from '@/lib'
import { logger } from '@/lib/logger'
import { Adapter } from '@/domain/types'
import { ForbiddenError } from '@/domain/errors'

type Params = Adapter

const moderationResponseSchema = z.object({
  flagged: z.boolean(),
  reason: z.string(),
})

const moderationResponseFormat = zodResponseFormat(moderationResponseSchema, 'ModerationResponse')

export type Moderate = (params: {
  messageId?: string
  content: string
  userId: string
}) => Promise<unknown>

export const buildModerate =
  ({ openrouterGateway, strikeRepository }: Params): Moderate =>
  async ({ messageId, content, userId }) => {
    const { message } = await openrouterGateway
      .sync({
        settings: {
          model: 'openai/gpt-4.1-mini',
          temperature: 0,
        },
        messages: [
          {
            role: 'user',
            content: `
You are a content-moderation assistant for an image-generation model (midjourney).  
Given a user prompt, check it against the rules below.  

If you detect a clear violation, output exactly
{
  "flagged": true,
  "reason": "<rule>: <brief explanation>"
}
citing the rule number.

If it's allowed or only borderline, output exactly
{
  "flagged": false,
  "reason": ""
}

Output only the JSON, nothing else.
Don't be too strict with the rules, allow for the gray area. Focus on clear and obvious violations.

────────────────────────────────────────
Rules:
1. "Safe For Work" (SFW) content only
1.1 Do not create or attempt to create gore or adult content. Avoid making visually shocking or disturbing content.
1.2 What is Considered Gore? Gore includes images of detached body parts of humans or animals, cannibalism, blood, violence (images of shooting or bombing someone, for instance), mutilated bodies, severed limbs, pestilence, detailed coprses, etc.
1.3 What is NSFW or Adult Content? Avoid nudity, sexual organs, fixation on such things, sexualized imagery, fetishes, people in showers, on toilets, etc. This includes:
   - Explicit sexual acts or stimulation
   - Explicit mention or focus on sexual organs (penis/половой член, vagina, breasts/nipples when sexualized, etc.)
   - Transparent clothing that would reveal sexual organs or intimate areas
   - Breastfeeding imagery
   - Euphemisms for sexual anatomy ("between the legs/между ногами", "groin area", etc.)
   - Sexualized poses (legs wrapped around waist, straddling, etc.)
   - Adult performers or porn actors in any context
   - Descriptions emphasizing sexual body parts or erotic positioning
   - References to underwear/nudity in sexual contexts
1.4 Do not create or attempt to create content that in any way sexualizes children or minors. This includes real images as well as generated images. Do not generate, upload, share, or make attempts to distribute content that depicts, promotes, or attempts to normalize child sexual abuse.
1.5 Do not create other offensive content. Other things may be deemed offensive or abusive because they can be viewed as racist, homophobic, disturbing, or in some way derogatory to a community. This includes offensive or inflammatory images of celebrities or public figures. Also includes content related to suicide or self-harm.
2. Do not create images or use text prompts that are inherently disrespectful, aggressive, or otherwise abusive.
3. Do not create or use imagery of real people, famous or otherwise, that could be explicitly used to harass, abuse, defame, or otherwise harm. Note: Celebrity likenesses in clearly fictional/fantasy contexts (like fantasy characters, superheroes, or other non-realistic scenarios) are acceptable unless explicitly defamatory or harmful. Personal photo references for positive/neutral/joke artistic purposes (fashion, portraits) are generally acceptable unless clearly intended for harassment.
4. Respect others' rights. Do not attempt to find out others' private information. Do not upload others' private information.
5. Do not generate images for political campaigns or to try to influence the outcome of an election.
6. Do not generate images to attempt to or to actually deceive or defraud anyone.
7. If prompt fully consists of phrase "I'm sorry, I can't assist with that request." You should flag it.

Detection patterns to flag:
- Any mention of sexual organs (penis, половой член, vagina, etc.)
- Any mention of sex/sexual activity ("sex", "секс", "sexual", "сексуальный")
- Transparent clothing descriptions
- Sexual positioning (legs wrapped around, straddling)
- Adult performers/porn actors
- Violence targeting genital areas
- Prompts that appear to be AI refusals ("I can't assist with that")
- Detailed anatomical descriptions that could recreate real people
- Suicide-related content
- Breast/chest area focus in swimwear contexts
- Words which can trigger midjourney's moderation to block request
- Drug use, drug consumption, substance abuse (наркотики, drugs, cocaine, heroin, etc.)
- Pills, tablets, medication in non-medical contexts (especially with sexual content)
- Nudity contexts (bathroom scenes, shower scenes, changing rooms)
- Sexual arousal terms ("horny", "возбужденный", sexual excitement)
- Dead bodies, corpses, cadavers (труп, мертвец, покойник)
- Death-related imagery with human remains

Important considerations:
- Swimwear and fashion imagery is acceptable unless explicitly sexualized or focusing on breast area
- Historical or educational content is generally acceptable
- Artistic interpretations are generally allowed unless clearly offensive
- Focus on explicit violations rather than borderline cases
- Children in non-sexual contexts are acceptable
- Comedy/cartoon scenarios with minor clothing mishaps are generally acceptable if not sexualized
- Political figures in mocking/derogatory contexts should be flagged
- Gaming/entertainment gun imagery (like Twitch emotes) is generally acceptable
- Suicide-related content should be flagged as disturbing
- Using personal photos for positive artistic purposes (elegant dresses, portraits, etc.) or jokes is generally acceptable
- Focus on intent - is the request meant to harm/harass or create positive/neutral content?
- Fashion and portrait requests using personal photos are typically allowed

────────────────────────────────────────
Examples:

User Prompt: "couple, frontal position, a 20-year-old girl sits on a table, Nymphadora Tonks, short pink hair, leather corset and trousers, a 20-year-old Harry Potter guy in a T-shirt and jeans, round glasses, stands in front of her, a girl wraps her legs around him and puts her hands on his shoulders, an old English medieval bar, rough wooden tables, bottles, lighting from candles, detailed digital brushstroked art in style of ross tran and artgerm, high contrast, emotional"
{ "flagged": true, "reason": "Rule 1.3: sexualized positioning with girl wrapping legs around waist" }

User Prompt: "Нарисуй Трампа в форме турецкой кружки"
{ "flagged": true, "reason": "Rule 1.5: mocking depiction of political figure" }

User Prompt: "I'm sorry, I can't assist with that request."
{ "flagged": true, "reason": "Rule 7: AI refusal response" }

User Prompt: "Create a dark/grim restaurant for suicides design"
{ "flagged": true, "reason": "Rule 1.5: suicide-related content is disturbing" }

User Prompt: "девушка в купальнике на груди тату Ocean Blade"
{ "flagged": true, "reason": "Rule 1.3: focus on chest/breast area in swimwear context" }

User Prompt: "Сгенерируй смайлик для твича где человек с фото с пистолетом"
{ "flagged": false, "reason": "" }

User Prompt: "найди похожие по фотографии симптомы зуд выпадает под мышками на половом члене на ляшках в виде шишок."
{ "flagged": true, "reason": "Rule 1.3: explicit mention of sexual organs (половой член)" }

────────────────────────────────────────
When you receive  
User Prompt: "<the user's text>"

Respond with exactly  
{
  "flagged": boolean,
  "reason": string
}
          `,
          },
          {
            role: 'user',
            content: `User prompt: ${content}`,
          },
        ],
        response_format: moderationResponseFormat,
        endUserId: userId,
      })
      .catch((error) => {
        logger.error({
          location: 'service.midjourney.moderate',
          message: getErrorString(error),
        })

        return {
          message: { content: '{ "flagged": true, "reason": "Moderation is not available" }' },
        }
      })

    let moderationResponse = {
      flagged: true,
      reason: 'Moderation failed',
    }
    try {
      const content = message.content ?? ''
      moderationResponse = moderationResponseSchema.parse(JSON.parse(content))
    } catch (error) {
      logger.error({
        location: 'service.midjourney.moderate',
        message: getErrorString(error),
      })
    }

    if (!moderationResponse.flagged) {
      return
    }

    await strikeRepository.create({
      data: {
        user_id: userId,
        message_id: messageId,
        ...(!messageId && { content }),
        reason: StrikeReason.MJ_MODERATION,
      },
    })

    throw new ForbiddenError({
      code: 'VIOLATION',
      message: moderationResponse.reason,
    })
  }
