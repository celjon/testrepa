import OpenAI from 'openai'
import axios, { AxiosInstance, isAxiosError } from 'axios'
import FormData from 'form-data'

export interface G4FClientOptions {
  apiUrl: string
  harManagerUrl: string
}

type ModelList = {
  object: 'list'
  data: Array<{
    id: string
    object: 'model'
    created: number
    owned_by: string
    image: boolean
    vision: boolean
  }>
}

type Provider = {
  id: string
  object: 'provider'
  created: number
  url: string
  label: string
}

export class G4FClient extends OpenAI {
  private readonly api: AxiosInstance
  private readonly harManager: AxiosInstance

  constructor({ apiUrl, harManagerUrl }: G4FClientOptions) {
    super({
      apiKey: ' ',
      baseURL: apiUrl
    })

    this.api = axios.create({
      baseURL: apiUrl
    })
    this.harManager = axios.create({
      baseURL: harManagerUrl
    })
  }

  public create(options: G4FClientOptions): G4FClient {
    return new G4FClient(options)
  }

  public async getModels(provider?: string): Promise<ModelList['data']> {
    try {
      let req

      if (provider) {
        req = await this.api.get<ModelList>(this.api.defaults.baseURL?.slice(0, -3) + `/api/${provider}/models`)
      } else {
        req = await this.api.get<ModelList>('/models')
      }

      const models = req.data.data.filter((model) => model.id !== 'auto')

      return models
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(`g4fClient.getModels ${error.response?.data ?? error.message}`)
      }

      throw error
    }
  }

  public async getProviders(): Promise<Array<Provider>> {
    try {
      const { data } = await this.api.get<Array<Provider>>('/providers')

      return data
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(`g4fClient.getProviders ${error.response?.data ?? error.message}`)
      }

      throw error
    }
  }

  public async getHARFiles(): Promise<string[]> {
    const { data } = await this.harManager.get<string[]>('/har-file/list')

    return data
  }

  public async readHARFile(params: { name: string; apiUrl: string }): Promise<Buffer> {
    const { data } = await this.harManager.get<Buffer>(`/har-file/${params.name}?worker_url=${params.apiUrl}`, {
      responseType: 'arraybuffer'
    })

    return data
  }

  public async writeHARFile(params: { name: string; buffer: Buffer<ArrayBufferLike>; apiUrl: string }): Promise<void> {
    const formData = new FormData()

    formData.append('file', params.buffer, params.name)
    formData.append('worker_url', params.apiUrl)

    await this.harManager.post(`/har-file`, formData.getBuffer(), {
      headers: formData.getHeaders()
    })
  }

  public async autoUpdateHARFiles(params: {
    accounts: {
      harFileName: string
      email: string
      password: string
      emailPassword: string
      imapServer: string
      apiUrl: string
    }[]
  }) {
    return this.harManager.post(
      `/har-file/auto-update`,
      {
        ...params,
        accounts: params.accounts.map(({ harFileName, emailPassword, imapServer, apiUrl,...account }) => ({
          ...account,
          har_file_name: harFileName,
          email_password: emailPassword,
          imap_server: imapServer,
          worker_url: apiUrl
        }))
      },
      {
        responseType: 'stream'
      }
    )
  }

  public async deleteHARFile(params: { name: string; apiUrl: string }): Promise<void> {
    await this.harManager.delete(`/har-file/${params.name}?worker_url=${params.apiUrl}`)
  }
}

export const newClient = (options: G4FClientOptions): { client: G4FClient } => {
  const client = new G4FClient(options)

  return {
    client
  }
}

export * from './types'
