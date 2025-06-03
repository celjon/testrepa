import { Arg, ArgumentValidationError, Ctx, Query, Resolver } from 'type-graphql'
import { ModelGraphQLObject, ModelPlatform, validModelPlatforms } from '@/domain/entity/model'
import { DeliveryParams } from '@/delivery/types'
import { GraphQLContext } from '../types'

type Params = Pick<DeliveryParams, 'model'>

const validateModelPlatform = (platform: string) => {
  const isValid = (validModelPlatforms as string[]).includes(platform)

  if (!isValid) {
    throw new ArgumentValidationError([{
      property: 'platform',
      constraints: {
        enum: 'Valid platforms are ' + validModelPlatforms.join(', ')
      },
    }])
  }
}

@Resolver(ModelGraphQLObject)
export class ModelResolver {
  constructor(private readonly params: Params) {}

  @Query(() => [ModelGraphQLObject])
  async models(
    @Ctx() { req }: GraphQLContext,
    @Arg('parentId', () => String, { nullable: true }) parentId?: string,
    @Arg('platform', () => String, {
      nullable: true,
      validateFn: validateModelPlatform
    })
    platform?: ModelPlatform,
    @Arg('children', () => Boolean, { nullable: true }) children?: boolean
  ): Promise<ModelGraphQLObject[]> {
    const data = await this.params.model.list({
      userId: req.user.id,
      listChildren: children,
      parentId,
      platform
    })

    return data
  }
}
