import { Adapter } from '../../types'

export type UnsetDefaultModelGlobally = (p: { modelId: string }) => Promise<void>

export const buildUnsetDefaultModelGlobally = ({
  planModelRepository,
}: Adapter): UnsetDefaultModelGlobally => {
  return async ({ modelId }) => {
    await planModelRepository.updateMany({
      where: {
        model_id: modelId,
      },
      data: {
        is_default_model: false,
      },
    })
  }
}
