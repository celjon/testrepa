import { UseCaseParams } from '@/domain/usecase/types'
import { EnterpriseRole } from '@prisma/client'
import { signJWT } from '@/lib'
import { ForbiddenError } from '@/domain/errors'

export type GenerateInviteToken = (data: { enterpriseId: string; userId: string }) => Promise<
  | {
      inviteToken: string
    }
  | never
>
export const buildGenerateInviteToken = ({ adapter }: UseCaseParams): GenerateInviteToken => {
  return async ({ enterpriseId, userId }) => {
    const employee = await adapter.employeeRepository.get({
      where: { user_id: userId, enterprise_id: enterpriseId }
    })
    if (!employee || employee.role !== EnterpriseRole.OWNER) {
      throw new ForbiddenError()
    }

    return {
      inviteToken: signJWT({
        enterpriseId: enterpriseId,
        expiresIn: '90d',
        keyEncryptionKey: null
      })
    }
  }
}
