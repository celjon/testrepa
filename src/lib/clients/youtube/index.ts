import axios from 'axios'
import { SocksProxyAgent } from 'socks-proxy-agent'
import { config } from '@/config'
import { buildGetTranscription } from './get-transcription'

export const newClient = () => {
  const { host, port, protocol, auth } = config.dynamic_proxy

  const customAxios = axios.create({
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      DNT: '1',
      Connection: 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    },
    httpsAgent: new SocksProxyAgent(
      `${protocol}://${auth.username}:${auth.password}@${host}:${port}`,
    )!,
  })

  const getTranscription = buildGetTranscription({ customAxios })

  return {
    client: {
      getTranscription,
    },
  }
}
