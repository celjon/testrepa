import { config } from '@/config'
import { Adapter } from '@/domain/types'
import { IModelAccount } from '@/domain/entity/modelAccount'

type Params = Pick<Adapter, 'cryptoGateway'>

export type DecryptAccount = (params: { account: IModelAccount }) => Promise<IModelAccount>

export const buildDecryptAccount =
  ({ cryptoGateway }: Params): DecryptAccount =>
  async ({ account }) => {
    if (account.g4f_password || account.g4f_email) {
      const dek = await cryptoGateway.getKeyFromString(config.model_providers.g4f.encryption_key)

      if (account.g4f_password) {
        account.g4f_password = await cryptoGateway.decrypt({
          dek,
          encryptedData: account.g4f_password
        })
      }
      if (account.g4f_email_password) {
        account.g4f_email_password = await cryptoGateway.decrypt({
          dek,
          encryptedData: account.g4f_email_password
        })
      }
    }

    return account
  }
