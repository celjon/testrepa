import { Arg, ArgumentValidationError, Ctx, Field, FieldResolver, Int, ObjectType, Query, Resolver, Root } from 'type-graphql'
import { DeliveryParams } from '@/delivery/types'
import { NotFoundError } from '@/domain/errors'
import { ChatGraphQLObject, ChatPlatform, IChat, validChatPlatforms } from '@/domain/entity/chat'
import { GraphQLContext } from '../types'
import {
  ChatSettingsCheckboxElementGraphQLObject,
  ChatSettingsCustomType,
  ChatSettingsFilesElementGraphQLObject,
  ChatSettingsGraphQLObject,
  ChatSettingsModelSelectElementGraphQLObject,
  ChatSettingsPresetSelectElementGraphQLObject,
  ChatSettingsRangeElementGraphQLObject,
  ChatSettingsSelectElementGraphQLObject,
  ChatSettingsTextAreaElementGraphQLObject,
  ChatSettingsTextElementGraphQLObject,
  IChatSettings
} from '@/domain/entity/chatSettings'
import { MessageGraphQLObject } from '@/domain/entity/message'
import { Platform } from '@prisma/client'

const validateChatPlatform = (platform: string) => {
  const isValid = (validChatPlatforms as string[]).includes(platform)

  if (!isValid) {
    throw new ArgumentValidationError([
      {
        property: 'platform',
        constraints: {
          enum: 'Valid platforms are ' + validChatPlatforms.join(', ')
        }
      }
    ])
  }
}

type Params = Pick<DeliveryParams, 'chat' | 'message'>

@ObjectType()
class ChatsList {
  @Field(() => [ChatGraphQLObject])
  data!: ChatGraphQLObject[]

  @Field(() => Int)
  pages!: number
}

@Resolver(ChatGraphQLObject)
export class ChatResolver {
  constructor(private readonly params: Params) {}

  @Query(() => ChatGraphQLObject, { nullable: true })
  async chat(
    @Ctx() { req }: GraphQLContext,
    @Arg('chatId', () => String, { nullable: true }) chatId?: string | null,
    @Arg('modelId', () => String, { nullable: true }) modelId?: string
  ): Promise<IChat | null> {
    if (!chatId) {
      return this.params.chat.getInitial({
        userId: req.user.id,
        modelId
      })
    }

    try {
      return await this.params.chat.get({
        userId: req.user.id,
        chatId: chatId
      })
    } catch (e) {
      if (e instanceof NotFoundError) {
        return null
      }
      throw e
    }
  }

  @Query(() => ChatsList)
  async chats(
    @Ctx() { req }: GraphQLContext,
    @Arg('groupId', () => String, { nullable: true }) groupId?: string,
    @Arg('groupIds', () => [String], { nullable: true }) groupIds?: string[],
    @Arg('page', () => Int, { nullable: true }) page?: number,
    @Arg('search', () => String, { nullable: true }) search?: string,
    @Arg('sort', () => String, { nullable: true }) sort?: string,
    @Arg('sortDirection', () => String, { nullable: true })
    sortDirection?: string,
    @Arg('quantity', () => Int, { nullable: true }) quantity?: number
  ): Promise<{ data: Array<IChat>; pages: number }> {
    try {
      return await this.params.chat.list({
        userId: req.user.id,
        groupId: groupId,
        groupIds: groupIds,
        page: page,
        search: search,
        sort: sort,
        sortDirection: sortDirection,
        quantity: quantity
      })
    } catch (e) {
      if (e instanceof NotFoundError) {
        return {
          data: [],
          pages: 0
        }
      }
      throw e
    }
  }

  @Query(() => ChatSettingsGraphQLObject)
  async chatSettings(
    @Ctx() { req }: GraphQLContext,
    @Arg('chatId', () => String) chatId: string,
    @Arg('all', () => Boolean, { nullable: true }) all?: boolean,
    @Arg('elements', () => Boolean, { nullable: true }) elements?: boolean,
    @Arg('platform', () => String, { nullable: true, validateFn: validateChatPlatform })
    platform?: ChatPlatform
  ): Promise<ChatSettingsGraphQLObject> {
    const settings = await this.params.chat.getSettings({
      userId: req.user.id,
      chatId: chatId,
      all: all,
      elements: elements,
      platform: platform ?? Platform.WEB
    })

    return {
      ...settings,
      elements: this.mapSettingsElements(settings.elements)
    }
  }

  @FieldResolver()
  @Query(() => ChatSettingsGraphQLObject)
  async settings(
    @Ctx() { req }: GraphQLContext,
    @Root() chat: ChatGraphQLObject,
    @Arg('all', () => Boolean, { nullable: true }) all?: boolean,
    @Arg('elements', () => Boolean, { nullable: true }) elements?: boolean,
    @Arg('platform', () => String, { nullable: true, validateFn: validateChatPlatform })
    platform?: ChatPlatform
  ): Promise<ChatSettingsGraphQLObject> {
    const settings = await this.params.chat.getSettings({
      userId: req.user.id,
      chatId: chat.id,
      all: all,
      elements: elements,
      platform: platform ?? Platform.WEB
    })

    return {
      ...settings,
      elements: this.mapSettingsElements(settings.elements)
    }
  }

  @FieldResolver()
  @Query(() => [MessageGraphQLObject])
  async messages(
    @Root() chat: ChatGraphQLObject,
    @Ctx() { req }: GraphQLContext,
    @Arg('page', () => Int, { nullable: true }) page?: number,
    @Arg('quantity', () => Int, { nullable: true }) quantity?: number
  ) {
    const { data } = await this.params.message.list({
      userId: req.user.id,
      keyEncryptionKey: req.user.keyEncryptionKey,
      chatId: chat.id,
      page: page,
      quantity: quantity
    })

    return data
  }

  private mapSettingsElements(settings: IChatSettings['elements']): ChatSettingsGraphQLObject['elements'] {
    return settings?.map((element) => {
      if (classMap[element.field_type] && element.field_type !== 'custom') {
        return toObjectType(classMap[element.field_type], element)
      }

      if (element.field_type !== 'custom') {
        return element
      }

      if (element.custom_type === ChatSettingsCustomType.MODEL_SELECT) {
        return toObjectType(ChatSettingsModelSelectElementGraphQLObject, element)
      }

      if (element.custom_type === ChatSettingsCustomType.PRESET_SELECT) {
        return toObjectType(ChatSettingsPresetSelectElementGraphQLObject, element)
      }

      if (element.custom_type === ChatSettingsCustomType.FILES) {
        return toObjectType(ChatSettingsFilesElementGraphQLObject, element)
      }

      return element
    })
  }
}

const classMap = {
  text: ChatSettingsTextElementGraphQLObject,
  textarea: ChatSettingsTextAreaElementGraphQLObject,
  range: ChatSettingsRangeElementGraphQLObject,
  checkbox: ChatSettingsCheckboxElementGraphQLObject,
  select: ChatSettingsSelectElementGraphQLObject,
  custom: {} as const
} as const

function toObjectType<T extends object>(Type: new (...args: unknown[]) => T, object: T) {
  return Object.assign(new Type(), object)
}
