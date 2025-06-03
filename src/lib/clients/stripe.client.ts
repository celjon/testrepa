import Stripe from 'stripe'

export const newClient = (config: { secretKey: string }) => {
  const client = new Stripe(config.secretKey)

  return {
    client
  }
}
