import { HashbonClient, Invoice } from './types'
import axios from 'axios'
import { sha256 } from 'js-sha256'

type Params = {
  shopId: number
  secretKey: string
}

export const newClient = ({
  shopId,
  secretKey
}: Params): {
  client: HashbonClient
} => {
  const apiUrl = 'https://hashbon.io/api/v1/invoices/'
  const api = axios.create({
    baseURL: apiUrl
  })
  api.interceptors.request.use((config) => {
    config.headers['Content-Type'] = 'application/json'
    config.headers['Shop-id'] = shopId
    return config
  })

  const client: HashbonClient = {
    getPaymentLink: (data): string => {
      let link: string = apiUrl + 'create/fromlink?shopId=' + shopId + '&amount=' + data.amount
      if (data.shopInvoiceId) {
        link += '&shopInvoiceId=' + data.shopInvoiceId
      }
      if (data.invoiceCurrency) {
        link += '&invoiceCurrency=' + data.invoiceCurrency
      }
      if (data.receiveCurrency) {
        link += '&receiveCurrency=' + data.receiveCurrency
      }
      return link
    },
    createInvoice: async (data): Promise<Invoice> => {
      const jsonData: string = JSON.stringify(data)
      const sign: string = sha256(jsonData + '/api/v1/invoices/create/fromdata' + secretKey)
      const result = await api.post<{
        type: string
        text?: string
        data?: { result: Invoice }
      }>('/create/fromdata', jsonData, {
        headers: {
          Sign: sign
        }
      })
      if (result.data.type !== 'success') {
        throw result.data.text
      }
      return result.data.data!.result
    }
  }
  return {
    client
  }
}

export * from './types'
