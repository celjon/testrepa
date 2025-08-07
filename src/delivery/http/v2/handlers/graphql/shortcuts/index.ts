import { Ctx, Query, Resolver } from 'type-graphql'
import { DeliveryParams } from '@/delivery/types'
import { GraphQLContext } from '../types'
import { ShortcutGraphQLObject } from '@/domain/entity/shortcut'

type Params = Pick<DeliveryParams, 'shortcut'>

@Resolver(ShortcutGraphQLObject)
export class ShortcutResolver {
  constructor(private readonly params: Params) {}

  @Query(() => [ShortcutGraphQLObject])
  async shortcuts(@Ctx() { req }: GraphQLContext): Promise<ShortcutGraphQLObject[]> {
    const data = await this.params.shortcut.list({
      userId: req.user.id,
    })

    return data
  }
}
