import { Query, Resolver } from 'type-graphql'
import { DeliveryParams } from '@/delivery/types'
import { PlanGraphQLObject } from '@/domain/entity/plan'

type Params = Pick<DeliveryParams, 'plan'>

@Resolver(PlanGraphQLObject)
export class PlanResolver {
  constructor(private readonly params: Params) {}

  @Query(() => [PlanGraphQLObject])
  async plans(): Promise<PlanGraphQLObject[]> {
    const data = await this.params.plan.list()

    return data
  }
}
