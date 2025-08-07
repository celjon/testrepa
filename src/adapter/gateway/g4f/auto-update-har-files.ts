import { AdapterParams } from '@/adapter/types'
import { AxiosResponse } from 'axios'
import { Observable } from 'rxjs'

type Params = Pick<AdapterParams, 'g4f'>

export type AutoUpdateHARFiles = (params: {
  harManagerUrl: string
  accounts: {
    harFileName: string
    email: string
    password: string
    emailPassword: string
    imapServer: string
    apiUrl: string
  }[]
}) => Promise<{
  stream: Observable<string>
  close: () => void
}>

export const buildAutoUpdateHARFiles = ({ g4f }: Params): AutoUpdateHARFiles => {
  return async ({ harManagerUrl, ...params }) => {
    const g4fClient = g4f.client.create({
      apiUrl: '',
      harManagerUrl,
    })

    let response: AxiosResponse | null = null
    const stream = new Observable<string>((subscriber) => {
      const handleStream = async () => {
        try {
          response = await g4fClient.autoUpdateHARFiles(params)

          response.data.on('data', (chunk: unknown) => {
            subscriber.next(`${chunk}`)
          })

          response.data.on('end', () => {
            subscriber.complete()
          })

          response.data.on('error', (err: unknown) => {
            subscriber.next(`Error occurred ${err}\n\n`)
          })
        } catch (e) {
          subscriber.next(`Error occurred ${e}\n\n`)
          subscriber.complete()
        }
      }
      handleStream()
    })

    const close = () => {
      response?.data.destroy()
    }

    return {
      stream,
      close,
    }
  }
}
