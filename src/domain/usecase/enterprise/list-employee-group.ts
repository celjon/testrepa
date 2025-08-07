import { EnterpriseRole } from '@prisma/client'
import { UseCaseParams } from '../types'
import { ForbiddenError } from '@/domain/errors'
import { IEmployeeGroup } from '@/domain/entity/employee-group'

export type ListEmployeeGroup = (data: {
  userId: string
  page: number
  quantity: number
}) => Promise<{ data: IEmployeeGroup[]; pages: number }>

export const buildListEmployeeGroup = ({ adapter, service }: UseCaseParams): ListEmployeeGroup => {
  return async ({ userId, page, quantity }) => {
    const employee = await adapter.employeeRepository.get({
      where: { user_id: userId },
    })

    if (!employee || employee.role !== EnterpriseRole.OWNER) {
      throw new ForbiddenError()
    }

    const query: any = {
      where: { enterprise_id: employee.enterprise_id },
      include: { employees: { include: { user: true } }, allowed_models: true },
    }

    return await service.employeeGroup.paginate({ query, page, quantity })
  }
}
