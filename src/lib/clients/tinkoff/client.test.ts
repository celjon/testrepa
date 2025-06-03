import { getToken, newClient } from './index'
import { describe, expect, test } from '@jest/globals'
import { faker } from '@faker-js/faker'

describe.skip('tinkoff client', () => {
  const client = newClient({
    terminalKey: '1685557539127DEMO',
    merchantPassword: '7u27zwoqkyqqhjhc'
  })

  test('hasher', () => {
    const dataToHash = {
      terminalKey: 'MerchantTerminalKey',
      amount: 19200,
      orderId: 21090,
      description: 'Подарочная карта на 1000 рублей',
      password: 'usaf8fw8fsw21g'
    }

    const hash = getToken(dataToHash)

    expect(hash).toBe('0024a00af7c350a3a67ca168ce06502aa72772456662e38696d48b56ee9c97d9')
  })

  test('create payment', async () => {
    const price = faker.number.int({
      max: 10000,
      min: 100
    })

    const email = faker.internet.email()
    const res = await client.client.payment.create({
      amount: price,
      orderId: faker.string.uuid(),
      description: faker.string.alpha({
        length: {
          min: 5,
          max: 40
        }
      }),
      data: {
        email
      },
      receipt: {
        email,
        items: [
          {
            amount: price,
            price: price,
            name: 'Test',
            quantity: 1,
            tax: 'vat0',
            paymentMethod: 'full_prepayment'
          }
        ],
        taxation: 'osn'
      }
    })
    expect(res.paymentUrl).not.toBeUndefined()
  })
})
