import { EnterpriseRole } from '@prisma/client'
import { UseCaseParams } from '../types'
import { ForbiddenError } from '@/domain/errors'

export type AddEmployeeModel = (data: {
  employeeId: string
  modelId: string
  userId: string
  enterpriseId: string
}) => Promise<void>

export const buildAddEmployeeModel = ({ adapter }: UseCaseParams): AddEmployeeModel => {
  return async ({ employeeId, modelId, enterpriseId, userId }) => {
    const user = await adapter.employeeRepository.get({
      where: { user_id: userId, enterprise_id: enterpriseId },
    })

    if (!user || user.role !== EnterpriseRole.OWNER) {
      throw new ForbiddenError()
    }

    await adapter.employeeRepository.update({
      where: {
        id: employeeId,
        enterprise_id: enterpriseId,
      },
      data: {
        allowed_models: {
          create: {
            model_id: modelId,
          },
        },
      },
    })
  }
}
