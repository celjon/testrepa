import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'mail'>

export type Send = (params: { from: string; to: string; subject: string; text: string }) => Promise<void | never>

export const buildSend = ({ mail: mailClient }: Params): Send => {
  return async (params) => {
    await mailClient.client.sendMail(params)

    return
  }
}
