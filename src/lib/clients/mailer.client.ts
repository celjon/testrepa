import * as nodemailer from 'nodemailer'

type NewClientParams = {
  host: string
  port: number
  user: string
  password: string
}

export const newClient = ({ host, port, user, password }: NewClientParams) => {
  const client = nodemailer.createTransport({
    // @ts-ignore
    host,
    port,
    auth: {
      user,
      pass: password
    },
    secure: true
  })
  return {
    client
  }
}
