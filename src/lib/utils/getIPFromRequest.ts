import { Request } from 'express'
import ipaddr from 'ipaddr.js'

export const getIPFromRequest = (req: Request) => {
  const ip = (req.header('x-real-ip') || req.header('x-forwarded-for') || req.ip) ?? ''

  const processedIP = ipaddr.process(ip.split(',')[0]).toString()

  return processedIP
}
