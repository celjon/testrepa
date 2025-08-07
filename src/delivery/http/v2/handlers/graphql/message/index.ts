import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql'
import { IMessage, MessageGraphQLObject } from '@/domain/entity/message'
import { DeliveryParams } from '@/delivery/types'
import { GraphQLContext } from '../types'

type Params = Pick<DeliveryParams, 'message'>

@Resolver(MessageGraphQLObject)
export class MessageResolver {
  constructor(private readonly params: Params) {}

  @Query(() => [MessageGraphQLObject])
  async messages(
    @Ctx() { req }: GraphQLContext,
    @Arg('chatId', () => String) chatId: string,
    @Arg('page', () => Int, { nullable: true }) page?: number,
    @Arg('quantity', () => Int, { nullable: true }) quantity?: number,
  ): Promise<Array<IMessage>> {
    const { data } = await this.params.message.list({
      userId: req.user.id,
      keyEncryptionKey: req.user.keyEncryptionKey,
      chatId: chatId,
      page: page,
      quantity: quantity,
    })

    return data
  }
}
