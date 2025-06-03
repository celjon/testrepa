import { DefaultMJConfig, LoadingHandler, MJConfig, MJConfigParam, MJMessage } from './interfaces'
import { formatOptions, sleep } from './utils'
import async from 'async'

export class MidjourneyMessage {
  public config: MJConfig

  constructor(defaults: MJConfigParam) {
    const { SalaiToken } = defaults
    if (!SalaiToken) {
      throw new Error('SalaiToken are required')
    }
    this.config = {
      ...DefaultMJConfig,
      ...defaults
    }
  }

  async FilterMessages(timestamp: number, prompt: string, loading?: LoadingHandler) {
    const seed = prompt.match(/\[(.*?)\]/)?.[1]
    this.log('seed:', seed)
    const data = await this.safeRetrieveMessages(this.config.Limit)
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      if (item.author.id === this.config.BotId && item.content.includes(`${seed}`)) {
        const itemTimestamp = new Date(item.timestamp).getTime()
        if (itemTimestamp < timestamp) {
          this.log('old message')
          continue
        }

        let url
        const progress = this.content2progress(item.content)

        if (item.attachments && item.attachments.length > 0) url = item.attachments[0]?.url

        if (url && this.config.ImageProxy !== '') {
          url = url.replace('https://cdn.discordapp.com/', this.config.ImageProxy)
        } //waiting

        if (progress !== 'done') {
          this.log('content', item.content)
          loading?.({ url, progress })
          break
        }

        //finished
        const content = item.content.split('**')[1]
        const { proxy_url, width, height } = item.attachments[0]
        const msg: MJMessage = {
          content,
          id: item.id,
          url,
          proxy_url,
          flags: item.flags,
          hash: this.UriToHash(url),
          progress: 'done',
          options: formatOptions(item.components),
          width,
          height
        }
        return msg
      }
    }
    return null
  }

  UriToHash(uri: string) {
    return uri.split('_').pop()?.split('.')[0] ?? ''
  }

  async WaitMessage(prompt: string, loading?: LoadingHandler, timestamp?: number) {
    timestamp = timestamp ?? Date.now()
    for (let i = 0; i < this.config.MaxWait; i++) {
      const msg = await this.FilterMessages(timestamp, prompt, loading)
      if (msg !== null) {
        return msg
      }
      this.log(i, 'wait no message found')
      await sleep(1000 * 2)
    }
    return null
  }

  async RetrieveMessages(limit = this.config.Limit) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: this.config.SalaiToken
    }
    const response = await this.config.fetch(
      `${this.config.DiscordBaseUrl}/api/v10/channels/${this.config.ChannelId}/messages?limit=${limit}`,
      {
        headers
      }
    )
    if (!response.ok) {
      this.log('error config', { config: this.config })
      this.log(`HTTP error! status: ${response.status}`)
    }
    const data: any = await response.json()
    return data
  }

  protected log(...args: any[]) {
    this.config.Debug && console.log(...args, new Date().toISOString())
  }

  protected content2progress(content: string) {
    const spcon = content.split('**')
    if (spcon.length < 3) {
      return ''
    }
    content = spcon[2]
    const regex = /\(([^)]+)\)/ // matches the value inside the first parenthesis
    const match = content.match(regex)
    let progress = ''
    if (match) {
      progress = match[1]
    }
    return progress
  }

  private safeRetrieveMessages = (request = 50) => {
    return new Promise<any>((resolve, reject) => {
      this.queue.push(
        {
          request,
          callback: (any: any) => {
            resolve(any)
          }
        },
        (error: any, result: any) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      )
    })
  }

  private processRequest = async ({ request, callback }: { request: any; callback: (any: any) => void }) => {
    const httpStatus = await this.RetrieveMessages(request)
    callback(httpStatus)
    await sleep(this.config.ApiInterval)
  }

  private queue = async.queue(this.processRequest, 1)
}
