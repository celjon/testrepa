import axios from 'axios'
import { SocksProxyAgent } from 'socks-proxy-agent'
import { config } from '@/config'
import { buildGetTranscription } from './getTranscription'

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)'

export const newClient = () => {
  const { host, port, protocol, auth } = config.dynamic_proxy

  const customAxios = axios.create({
    headers: {
      'User-Agent': USER_AGENT
    },
    httpsAgent: new SocksProxyAgent(`${protocol}://${auth.username}:${auth.password}@${host}:${port}`)!
  })

  const getTranscription = buildGetTranscription({ customAxios })

  return {
    client: {
      getTranscription
    }
  }
}
