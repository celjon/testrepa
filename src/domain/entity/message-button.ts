import { Field, ID, ObjectType } from 'type-graphql'
import { MessageButton, MessageButtonAction, MessageButtonType } from '@prisma/client'
import { IMessage } from './message'

/**
 * @openapi
 * components:
 *   entities:
 *      MessageButton:
 *          required:
 *            - id
 *            - type
 *            - action
 *            - disabled
 *            - created_at
 *          properties:
 *            id:
 *                type: string
 *            type:
 *                type: string
 *            action:
 *                type: string
 *            disabled:
 *                type: boolean
 *            created_at:
 *                type: string
 *                format: date
 */
export interface IMessageButton extends MessageButton {
  message?: IMessage | null
}

@ObjectType('MessageButton')
export class MessageButtonGraphQLObject implements IMessageButton {
  @Field(() => ID)
  id!: string

  @Field(() => MessageButtonType)
  type!: MessageButtonType

  @Field(() => MessageButtonAction)
  action!: MessageButtonAction

  @Field(() => Boolean)
  disabled!: boolean

  @Field(() => ID, { nullable: true })
  message_id!: string | null

  @Field(() => ID, { nullable: true })
  parent_message_id!: string | null

  @Field(() => ID, { nullable: true })
  parent_image_id!: string | null

  @Field(() => String, { nullable: true })
  mj_native_label!: string | null

  @Field(() => String, { nullable: true })
  mj_native_custom!: string | null

  @Field(() => String, { nullable: true })
  mj_message_id!: string | null

  @Field(() => String, { nullable: true })
  mj_account_id!: string | null

  @Field(() => Date)
  created_at!: Date
}

export function getMessageButtonActionByMJNativeButton(mjNativeButton: string) {
  switch (mjNativeButton) {
    case 'U1':
      return MessageButtonAction.MJ_UPSCALE_1
    case 'U2':
      return MessageButtonAction.MJ_UPSCALE_2
    case 'U3':
      return MessageButtonAction.MJ_UPSCALE_3
    case 'U4':
      return MessageButtonAction.MJ_UPSCALE_4
    case '🔄':
      return MessageButtonAction.MJ_REGENERATE
    case 'V1':
      return MessageButtonAction.MJ_VARIATION_1
    case 'V2':
      return MessageButtonAction.MJ_VARIATION_2
    case 'V3':
      return MessageButtonAction.MJ_VARIATION_3
    case 'V4':
      return MessageButtonAction.MJ_VARIATION_4
    case '⬅️':
      return MessageButtonAction.MJ_LEFT
    case '➡️':
      return MessageButtonAction.MJ_RIGHT
    case '⬆️':
      return MessageButtonAction.MJ_UP
    case '⬇️':
      return MessageButtonAction.MJ_DOWN
    case 'Vary (Subtle)':
      return MessageButtonAction.MJ_VARY_SUBTILE
    case 'Vary (Strong)':
      return MessageButtonAction.MJ_VARY_STRONG
    case 'Vary (Region)':
      return MessageButtonAction.MJ_VARY_REGION
    case 'Custom Zoom':
      return MessageButtonAction.MJ_CUSTOM_ZOOM
    case 'Zoom Out 2x':
      return MessageButtonAction.MJ_ZOOM_OUT_2X
    case 'Zoom Out 1.5x':
      return MessageButtonAction.MJ_ZOOM_OUT_1_5X
    case 'Upscale (Subtle)':
      return MessageButtonAction.MJ_UPSCALE_SUBTLE
    case 'Upscale (Creative)':
      return MessageButtonAction.MJ_UPSCALE_CREATIVE
    case 'Make Square':
      return MessageButtonAction.MJ_MAKE_SQUARE
    case 'Redo Upscale (Subtle)':
      return MessageButtonAction.MJ_REDO_UPSCALE_SUBTLE
    case 'Redo Upscale (Creative)':
      return MessageButtonAction.MJ_REDO_UPSCALE_CREATIVE
    case 'Upscale (2x)':
      return MessageButtonAction.MJ_UPSCALE_2X
    case 'Upscale (4x)':
      return MessageButtonAction.MJ_UPSCALE_4X
    case 'Redo Upscale (2x)':
      return MessageButtonAction.MJ_REDO_UPSCALE_2X
    case 'Redo Upscale (4x)':
      return MessageButtonAction.MJ_REDO_UPSCALE_4X
    default:
      return MessageButtonAction.UNKNOWN
  }
}
