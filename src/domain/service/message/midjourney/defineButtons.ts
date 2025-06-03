import { Adapter } from '@/adapter'
import { getMessageButtonActionByMJNativeButton, IMessageButton } from '@/domain/entity/messageButton'
import { IMessageImage } from '@/domain/entity/messageImage'
import { MidjourneyButtonResult, MidjourneyImagineResult } from '@/lib/clients/midjourney-api'
import { FileType, MessageButtonAction, MessageButtonType } from '@prisma/client'
import axios from 'axios'

type Params = Adapter

export type DefineButtonsAndImages = (params: {
  generationResult: (MidjourneyImagineResult | MidjourneyButtonResult) & { accountId: string }
  messageId: string
  disabledButtons?: string[]
}) => Promise<{ messageImages: IMessageImage[]; messageButtons: IMessageButton[] }>

export const buildDefineButtonsAndImages = ({
  imageGateway,
  storageGateway,
  messageImageRepository,
  messageButtonRepository
}: Params): DefineButtonsAndImages => {
  return async ({ generationResult, messageId, disabledButtons = ['❤️'] }) => {
    const {
      accountId,
      id: nativeMessageId,
      options: buttons,
      url: imageUrl,
      width: imageWidth = 2048,
      height: imageHeight = 2048
    } = generationResult

    const messageImages: IMessageImage[] = []
    const messageButtons: IMessageButton[] = []
    const imageButtons: string[] = []

    const { data: imageBuffer } = await axios<Buffer>({
      method: 'get',
      url: imageUrl,
      responseType: 'arraybuffer'
    })

    if (!buttons) {
      return {
        messageImages,
        messageButtons
      }
    }
    if (['U1', 'U2', 'U3', 'U4', 'V1', 'V2', 'V3', 'V4'].every((label) => buttons.some((button) => button.label.includes(label)))) {
      const images = await Promise.all(
        Array(4)
          .fill(0)
          .map((_, i) =>
            imageGateway.extract({
              buffer: imageBuffer,
              top: i < 2 ? 0 : imageHeight / 2,
              left: i % 2 === 0 ? 0 : imageWidth / 2,
              width: imageWidth / 2,
              height: imageHeight / 2
            })
          )
      )
      const previewImages = await Promise.all(
        images.map((previewImage) =>
          imageGateway.resize({
            buffer: previewImage.buffer,
            height: 256
          })
        )
      )

      for (let index = 0; index < images.length; index++) {
        const [mjImage, mjPreviewImage] = await Promise.all([
          storageGateway.write({
            buffer: images[index].buffer,
            ext: '.png'
          }),
          storageGateway.write({
            buffer: previewImages[index].buffer,
            ext: '.png'
          })
        ])

        const upscaleButton = buttons.find((button) => button.label === `U${index + 1}`)
        const variationButton = buttons.find((button) => button.label === `V${index + 1}`)

        const messageImage = await messageImageRepository.create({
          data: {
            width: images[index].info.width,
            height: images[index].info.height,
            preview_width: previewImages[index].info.width,
            preview_height: previewImages[index].info.height,
            original: {
              create: {
                type: FileType.IMAGE,
                name: mjImage.name,
                path: mjImage.path,
                url: mjImage.url
              }
            },
            preview: {
              create: {
                type: FileType.IMAGE,
                name: mjPreviewImage.name,
                path: mjPreviewImage.path,
                url: mjPreviewImage.url
              }
            },
            buttons: {
              createMany: {
                data: [
                  {
                    mj_account_id: accountId,
                    mj_message_id: nativeMessageId,
                    type: MessageButtonType.MJ_BUTTON,
                    action: getMessageButtonActionByMJNativeButton(upscaleButton!.label),
                    mj_native_custom: upscaleButton!.custom,
                    mj_native_label: upscaleButton!.label,
                    message_id: messageId
                  },
                  {
                    mj_account_id: accountId,
                    mj_message_id: nativeMessageId,
                    type: MessageButtonType.MJ_BUTTON,
                    action: getMessageButtonActionByMJNativeButton(variationButton!.label),
                    mj_native_custom: variationButton!.custom,
                    mj_native_label: variationButton!.label,
                    message_id: messageId
                  },
                  {
                    action: MessageButtonAction.DOWNLOAD
                  }
                ]
              }
            }
          },
          include: {
            original: true
          }
        })

        messageImages.push(messageImage)

        imageButtons.push(upscaleButton!.label, variationButton!.label)
      }
    } else {
      const imageInStorage = await storageGateway.write({
        buffer: imageBuffer,
        ext: '.png'
      })
      const { width: mjImageWidth = 1024, height: mjImageHeight = 1024 } = await imageGateway.metadata({
        buffer: imageInStorage.buffer
      })

      const {
        buffer: previewImageBuffer,
        info: { width: mjPreviewImageWidth, height: mjPreviewImageHeight }
      } = await imageGateway.resize({
        buffer: imageBuffer,
        height: 512
      })
      const previewImageInStorage = await storageGateway.write({
        buffer: previewImageBuffer,
        ext: '.png'
      })

      const messageImageButtons: IMessageButton[] = []

      if (['⬅️', '➡️', '⬆️', '⬇️'].every((label) => buttons.some((button) => button.label.includes(label)))) {
        messageImageButtons.push(
          ...(await Promise.all([
            messageButtonRepository.create({
              data: {
                mj_account_id: accountId,
                mj_message_id: nativeMessageId,
                mj_native_custom: buttons.find((button) => button.label === '⬅️')!.custom,
                mj_native_label: '⬅️',
                type: MessageButtonType.MJ_BUTTON,
                action: MessageButtonAction.MJ_LEFT,
                message_id: messageId
              }
            }),
            messageButtonRepository.create({
              data: {
                mj_account_id: accountId,
                mj_message_id: nativeMessageId,
                mj_native_custom: buttons.find((button) => button.label === '➡️')!.custom,
                mj_native_label: '➡️',
                type: MessageButtonType.MJ_BUTTON,
                action: MessageButtonAction.MJ_RIGHT,
                message_id: messageId
              }
            }),
            messageButtonRepository.create({
              data: {
                mj_account_id: accountId,
                mj_message_id: nativeMessageId,
                mj_native_custom: buttons.find((button) => button.label === '⬆️')!.custom,
                mj_native_label: '⬆️',
                type: MessageButtonType.MJ_BUTTON,
                action: MessageButtonAction.MJ_UP,
                message_id: messageId
              }
            }),
            messageButtonRepository.create({
              data: {
                mj_account_id: accountId,
                mj_message_id: nativeMessageId,
                mj_native_custom: buttons.find((button) => button.label === '⬇️')!.custom,
                mj_native_label: '⬇️',
                type: MessageButtonType.MJ_BUTTON,
                action: MessageButtonAction.MJ_DOWN,
                message_id: messageId
              }
            })
          ]))
        )

        imageButtons.push('⬅️', '➡️', '⬆️', '⬇️')
      }

      const messageImage = await messageImageRepository.create({
        data: {
          width: mjImageWidth,
          height: mjImageHeight,
          preview_width: mjPreviewImageWidth,
          preview_height: mjPreviewImageHeight,
          original: {
            create: {
              type: FileType.IMAGE,
              name: imageInStorage.name,
              path: imageInStorage.path,
              url: imageInStorage.url
            }
          },
          preview: {
            create: {
              type: FileType.IMAGE,
              name: previewImageInStorage.name,
              path: previewImageInStorage.path,
              url: previewImageInStorage.url
            }
          },
          buttons: {
            connect: messageImageButtons.map(({ id }) => ({ id })),
            createMany: {
              data: [
                {
                  action: MessageButtonAction.DOWNLOAD
                }
              ]
            }
          }
        },
        include: {
          original: true
        }
      })

      messageImages.push(messageImage)

      for (const button of buttons) {
        if (imageButtons.includes(button.label)) {
          continue
        }

        const action = getMessageButtonActionByMJNativeButton(button.label)
        const isDisabled = disabledButtons.includes(button.label)

        const messageButton = await messageButtonRepository.create({
          data: {
            mj_account_id: accountId,
            mj_message_id: nativeMessageId,
            mj_native_label: button.label,
            type: MessageButtonType.MJ_BUTTON,
            action,
            mj_native_custom: button.custom,
            disabled: isDisabled,
            message_id: messageId
          }
        })

        messageButtons.push(messageButton)
      }
    }

    return {
      messageImages,
      messageButtons
    }
  }
}
