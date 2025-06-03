import { IUser } from '@/domain/entity/user'

export type HasEnterpriseActualSubscription = (user: IUser) => boolean

export const buildHasEnterpriseActualSubscription = (): HasEnterpriseActualSubscription => {
  return (user) => !!user.employees && !!user.employees[0] && !!user.employees[0].enterprise && user.employees[0].enterprise.common_pool
}
