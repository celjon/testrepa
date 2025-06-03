import { ModelAccountStatus } from '@prisma/client'

export function determineJobMode(status: string): ModelAccountStatus {
  switch (status.toLocaleLowerCase()) {
    case 'fast':
      return ModelAccountStatus.FAST
    case 'relaxed':
      return ModelAccountStatus.RELAX
    default:
      return ModelAccountStatus.INACTIVE
  }
}
