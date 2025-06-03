import { IChatSettings } from '@/domain/entity/chatSettings'
import { IMessage } from '@/domain/entity/message'
import { IModel, isTextModel } from '@/domain/entity/model'
import { tokenize } from '@/lib/tokenizer'

export type Tokenize = (params: {
  model: IModel
  messages?: (Pick<IMessage, 'role'> & {
    content:
      | string
      | null
      | Array<
          | {
              type: 'text'
              text: string
            }
          | {
              type: 'image_url'
              image_url: {
                url: string
              }
            }
        >
  } & Partial<Pick<IMessage, 'full_content' | 'images'>>)[]
  outputMessage?: Pick<IMessage, 'content'> & Partial<Pick<IMessage, 'full_content'>>
  settings?: IChatSettings
  multipler?: {
    input?: number
    inputImage?: number
    output?: number
    discount?: number
  }
}) => Promise<number>

export const buildTokenize =
  (): Tokenize =>
  async ({
    model,
    messages,
    outputMessage,
    settings,
    multipler = {
      input: 1,
      inputImage: 1,
      output: 1,
      discount: 1
    }
  }) => {
    if (!isTextModel(model)) {
      return 0
    }

    const { input = 1, inputImage = 1, output = 1, discount = 1 } = multipler

    let tokens = 0

    if (settings && settings.text) {
      tokens += tokenize(settings.text.full_system_prompt ?? settings.text.system_prompt ?? '', model.id) * input * discount
    }

    if (messages && messages.length > 0) {
      tokens += messages.reduce((totalTokens, message) => {
        let imagesTokens: number

        if (message.images) {
          imagesTokens =
            message.images
              .map(({ width, height }) => Math.ceil(Math.ceil(width / 512) * Math.ceil(height / 512) * 170 + 85))
              .reduce((imagesTokens, tokens) => imagesTokens + tokens, 0) *
            inputImage *
            discount
        } else {
          imagesTokens = 0
        }

        const content = Array.isArray(message.content)
          ? message.content.reduce((result, curr) => {
              const part = curr.type === 'text' ? curr.text : ''
              return result + part
            }, '')
          : (message.full_content ?? message.content ?? '')

        const contentTokens = tokenize(content, model.id) * input * discount

        return totalTokens + imagesTokens + contentTokens
      }, 0)
    }

    if (outputMessage) {
      tokens += tokenize(outputMessage.full_content ?? outputMessage.content ?? '', model.id) * output * discount
    }

    return tokens
  }
