import { AdapterParams } from '@/adapter/types'
import { buildUpdateMany, UpdateMany } from './update-many'
import { buildDeleteMany, DeleteMany } from './delete-many'

type Params = Pick<AdapterParams, 'db'>

export type ReferralParticipantRepository = {
  updateMany: UpdateMany
  deleteMany: DeleteMany
}
export const buildReferralParticipantRepository = (
  params: Params,
): ReferralParticipantRepository => {
  const updateMany = buildUpdateMany(params)
  const deleteMany = buildDeleteMany(params)
  return {
    updateMany,
    deleteMany,
  }
}
