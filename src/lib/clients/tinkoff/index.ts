import axios, { AxiosError } from 'axios'
import { createHash } from 'crypto'
// import { SocksProxyAgent } from 'socks-proxy-agent'
// import { config } from '@/config'
import { logger } from '@/lib/logger'
import { getErrorString } from '@/lib/utils'
import { CreatePaymentError } from './errors'
import { CreatePaymentParams, CreatePaymentPayloadSuccess } from './types'

export type ClientParams = {
  terminalKey: string
  merchantPassword: string
  payment?: {
    webhook?: string
    successRedirect?: string
  }
}

export type TinkoffClient = {
  payment: {
    create: (p: CreatePaymentParams) => Promise<CreatePaymentPayloadSuccess | never>
  }
}

// https://www.tbank.ru/kassa/dev/payments/#section/Token
export const getToken = (data: {
  terminalKey: string
  amount: number
  orderId: string | number
  description?: string | undefined
  password: string
  notificationURL?: string | undefined
  successURL?: string | undefined
}) => {
  // Sort by keys alphabetically
  const sortedKVPairs = Object.entries(data).sort((a, b) => {
    if (a[0][0] < b[0][0]) {
      return -1
    }
    if (a[0][0] > b[0][0]) {
      return 1
    }
    return 0
  })

  const str = sortedKVPairs.map((pair) => String(pair[1])).join('')

  return createHash('sha256').update(str, 'utf8').digest('hex')
}

export const newClient = ({
  terminalKey,
  merchantPassword,
  payment,
}: ClientParams): {
  client: TinkoffClient
} => {
  const createPayment = async (
    params: CreatePaymentParams,
  ): Promise<CreatePaymentPayloadSuccess | never> => {
    const dataToHash = {
      terminalKey,
      amount: params.amount,
      orderId: params.orderId,
      ...(params.description && { description: params.description }),
      password: merchantPassword,
      ...(payment?.webhook && {
        notificationURL: payment.webhook,
      }),
      ...(payment?.successRedirect && {
        successURL: payment.successRedirect,
      }),
    }

    const token = getToken(dataToHash)

    const { data } = await axios
      .post('https://securepay.tinkoff.ru/v2/Init', {
        TerminalKey: terminalKey,
        Amount: params.amount,
        Token: token,
        OrderId: params.orderId,
        Description: params.description || '',
        DATA: {
          ...(params.data.email && { Email: params.data.email }),
        },
        ...(payment?.webhook && {
          NotificationURL: payment.webhook,
        }),
        ...(payment?.successRedirect && {
          SuccessURL: payment.successRedirect,
        }),
        Receipt: {
          ...(params.receipt.email && {
            Email: params.receipt.email,
          }),
          Taxation: params.receipt.taxation,
          Items: params.receipt.items.map((el) => {
            return {
              Name: el.name,
              Amount: el.amount,
              Price: el.price,
              Tax: el.tax,
              Quantity: el.quantity,
            }
          }),
        },
      })
      .catch((error) => {
        logger.error({
          location: 'tinkoff.createPayment',
          message: getErrorString(error),
        })

        if (error instanceof AxiosError) {
          throw new CreatePaymentError({
            message: error.message,
            errorCode: error.response?.statusText || '',
            details: error.response?.data?.toString(),
          })
        }

        throw new CreatePaymentError({
          message: error.message,
          errorCode: 'unknown error',
          details: '',
        })
      })

    if (!data.Success) {
      throw new CreatePaymentError({
        errorCode: data.ErrorCode,
        message: data.Message,
        details: data.Details,
      })
    }

    return {
      paymentId: data.PaymentId,
      success: data.Success,
      paymentUrl: data.PaymentURL,
      terminalKey: data.TerminalKey,
      status: data.Status,
      errorCode: data.ErrorCode,
      amount: data.Amount,
      orderId: data.OrderId,
    }
  }

  return {
    client: {
      payment: {
        create: createPayment,
      },
    },
  }
}

export * from './types'
export * from './errors'
