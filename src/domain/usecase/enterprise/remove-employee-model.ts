import { EnterpriseRole } from '@prisma/client'
import { UseCaseParams } from '../types'
import { ForbiddenError } from '@/domain/errors'

export type RemoveEmployeeModel = (data: { employeeId: string; modelId: string; userId: string; enterpriseId: string }) => Promise<void>

export const buildRemoveEmployeeModel = ({ adapter }: UseCaseParams): RemoveEmployeeModel => {
  return async ({ employeeId, modelId, enterpriseId, userId }) => {
    const user = await adapter.employeeRepository.get({
      where: { user_id: userId, enterprise_id: enterpriseId }
    })

    if (!user || user.role !== EnterpriseRole.OWNER) {
      throw new ForbiddenError()
    }

    await adapter.employeeRepository.update({
      where: {
        id: employeeId,
        enterprise_id: enterpriseId
      },
      data: {
        allowed_models: {
          delete: {
            employee_id_model_id: {
              employee_id: employeeId,
              model_id: modelId
            }
          }
        }
      }
    })
  }
}
