import { Ctx, Query, Resolver } from 'type-graphql'
import { UserGraphQLObject } from '@/domain/entity/user'
import { DeliveryParams } from '@/delivery/types'
import { GraphQLContext } from '../types'

type Params = Pick<DeliveryParams, 'auth'>

@Resolver(UserGraphQLObject)
export class AuthResolver {
  constructor(private readonly params: Params) {}

  @Query(() => UserGraphQLObject)
  me(@Ctx() { req }: GraphQLContext): Promise<UserGraphQLObject> {
    return this.params.auth.getMe({
      id: req.user.id
    })
  }
}
