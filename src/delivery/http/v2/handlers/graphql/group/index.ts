import { Arg, Ctx, Field, Int, ObjectType, Query, Resolver } from 'type-graphql'
import { DeliveryParams } from '@/delivery/types'
import { GroupGraphQLObject } from '@/domain/entity/group'
import { GraphQLContext } from '../types'

type Params = Pick<DeliveryParams, 'group'>

@ObjectType()
class GroupsList {
  @Field(() => [GroupGraphQLObject])
  data!: GroupGraphQLObject[]

  @Field(() => Number)
  pages!: number
}

@Resolver(GroupGraphQLObject)
export class GroupResolver {
  constructor(private readonly params: Params) {}

  @Query(() => GroupsList)
  groups(
    @Ctx() { req }: GraphQLContext,
    @Arg('page', () => Int, { nullable: true }) page?: number,
    @Arg('search', () => String, { nullable: true }) search?: string,
    @Arg('sort', () => String, { nullable: true }) sort?: string,
    @Arg('sortDirection', () => String, { nullable: true })
    sortDirection?: string
  ): Promise<GroupsList> {
    return this.params.group.list({
      userId: req.user.id,
      page: page,
      search: search,
      sort: sort,
      sortDirection: sortDirection
    })
  }
}
