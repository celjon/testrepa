import { logger } from '@/lib/logger'
import {
  LoadingHandler,
  MJConfig,
  MJDescribe,
  MJEmit,
  MJInfo,
  MJMessage,
  MJMessageDone,
  MJSettings,
  MJShorten,
  OnModal,
  WaitMjEvent,
} from './interfaces'
import { MidjourneyApi } from './midjourney.api'
import {
  content2progress,
  content2prompt,
  formatInfo,
  formatOptions,
  formatPrompts,
  nextNonce,
  uriToHash,
} from './utils'
import { VerifyHuman } from './verify.human'
import WebSocket from 'isomorphic-ws'

export class WsMessage {
  ws: WebSocket
  private closed = false
  private event: Array<{ event: string; callback: (message: any) => void }> = []
  private waitMjEvents: Map<string, WaitMjEvent> = new Map()
  private skipMessageId: string[] = []
  private reconnectTime: boolean[] = []
  private heartbeatInterval = 0
  public UserId = ''
  constructor(
    public config: MJConfig,
    public MJApi: MidjourneyApi,
  ) {
    this.ws = new this.config.WebSocket(this.config.WsBaseUrl)
    this.ws.addEventListener('open', this.open.bind(this))
    this.onSystem('messageCreate', this.onMessageCreate.bind(this))
    this.onSystem('messageUpdate', this.onMessageUpdate.bind(this))
    this.onSystem('messageDelete', this.onMessageDelete.bind(this))
    this.onSystem('ready', this.onReady.bind(this))
    this.onSystem('interactionSuccess', this.onInteractionSuccess.bind(this))
  }

  private async heartbeat(num: number) {
    if (this.reconnectTime[num]) return
    //check if ws is closed
    if (this.closed) return
    if (this.ws.readyState !== this.ws.OPEN) {
      this.reconnect()
      return
    }
    await this.log('heartbeat', this.heartbeatInterval)
    this.heartbeatInterval++
    this.ws.send(
      JSON.stringify({
        op: 1,
        d: this.heartbeatInterval,
      }),
    )
    await this.timeout(1000 * 40)
    await this.heartbeat(num)
  }
  close() {
    this.closed = true
    this.ws.close()
  }
  async checkWs() {
    if (this.closed) return
    if (this.ws.readyState !== this.ws.OPEN) {
      this.reconnect()
      await this.onceReady()
    }
  }

  async onceReady() {
    return new Promise((resolve) => {
      this.once('ready', (user) => {
        //print user nickname
        logger.info(`🎊 ws ready!!! Hi: ${user.global_name}`)
        resolve(this)
      })
    })
  }
  //try reconnect
  reconnect() {
    if (this.closed) return
    this.ws = new this.config.WebSocket(this.config.WsBaseUrl)
    this.heartbeatInterval = 0
    this.ws.addEventListener('open', this.open.bind(this))
  }
  // After opening ws
  private async open() {
    const num = this.reconnectTime.length
    await this.log('open.time', num)
    this.reconnectTime.push(false)
    this.auth()
    this.ws.addEventListener('message', (event: any) => {
      this.parseMessage(event.data as string)
    })
    this.ws.addEventListener('error', (_: any) => {
      this.reconnectTime[num] = true
      this.reconnect()
    })
    this.ws.addEventListener('close', (_: any) => {
      this.reconnectTime[num] = true
      this.reconnect()
    })
    setTimeout(() => {
      this.heartbeat(num)
    }, 1000 * 10)
  }
  // auth
  private auth() {
    this.ws.send(
      JSON.stringify({
        op: 2,
        d: {
          token: this.config.SalaiToken,
          capabilities: 8189,
          properties: {
            os: 'Mac OS X',
            browser: 'Chrome',
            device: '',
          },
          compress: false,
        },
      }),
    )
  }
  async timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
  private async messageCreate(message: any) {
    const { embeds, id, nonce, components, attachments } = message
    if (nonce) {
      // this.log("waiting start image or info or error");
      this.updateMjEventIdByNonce(id, nonce)
      if (embeds?.[0]) {
        const { color, description, title } = embeds[0]
        await this.log('embeds[0].color', color)
        switch (color) {
          case 16711680: {
            //error
            if (
              title == 'Action needed to continue' &&
              !description.includes(
                'Sorry! Our AI moderators feel your prompt might be against our community standards.',
              )
            ) {
              return this.continue(message)
            } else if (title == 'Pending mod message') {
              return this.continue(message)
            }

            const error = new Error(description)
            this.EventError(id, error)
            return
          }

          case 16776960: //warning
            console.warn(description)
            break

          case 15844367:
            this.EventError(id, new Error(description))
            break

          default:
            if (title?.includes('continue') && description?.includes("verify you're human")) {
              //verify human
              await this.verifyHuman(message)
              return
            }

            if (title?.includes('Invalid')) {
              //error
              const error = new Error(description)
              this.EventError(id, error)
              return
            }
        }
      }
    }
    if (nonce && attachments?.length > 0 && components?.length > 0) {
      this.done(message)
      return
    }

    this.messageUpdate(message)
  }

  private messageUpdate(message: any) {
    const { content, embeds, interaction = {}, nonce, id, components } = message

    if (!nonce) {
      const { name } = interaction

      switch (name) {
        case 'settings':
          this.emit('settings', message)
          return
        case 'describe': {
          let url = embeds?.[0]?.image?.url
          if (this.config.ImageProxy !== '') {
            url = url.replace('https://cdn.discordapp.com/', this.config.ImageProxy)
          }
          const describe: MJDescribe = {
            id: id,
            flags: message.flags,
            descriptions: embeds?.[0]?.description.split('\n\n'),
            url,
            proxy_url: embeds?.[0]?.image?.proxy_url,
            options: formatOptions(components),
          }
          this.emitMJ(id, describe)
          break
        }
        case 'prefer remix':
          if (content != '') {
            this.emit('prefer-remix', content)
          }
          break
        case 'shorten': {
          const shorten: MJShorten = {
            description: embeds?.[0]?.description,
            prompts: formatPrompts(embeds?.[0]?.description as string),
            options: formatOptions(components),
            id,
            flags: message.flags,
          }
          this.emitMJ(id, shorten)
          break
        }
        case 'info':
          this.emit('info', embeds?.[0]?.description)
          return
      }
    }
    if (embeds?.[0]) {
      const { description, title } = embeds[0]
      if (title === 'Duplicate images detected') {
        const error = new Error(description)
        this.EventError(id, error)
        return
      }
      if (title === 'Request cancelled due to output filters') {
        const error = new Error(description)
        this.EventError(id, error)
        return
      }
    }

    if (content) {
      this.processingImage(message)
    }
  }

  //interaction success
  private async onInteractionSuccess({ nonce, id }: { nonce: string; id: string }) {
    // this.log("interactionSuccess", nonce, id);
    const event = this.getEventByNonce(nonce)
    if (!event) {
      return
    }
    event.onmodal && (await event.onmodal(nonce, id))
  }
  private async onReady(user: any) {
    this.UserId = user.id
  }
  private async onMessageCreate(message: any) {
    const { channel_id, author, interaction } = message
    if (channel_id !== this.config.ChannelId) return
    if (author?.id !== this.config.BotId) return
    if (interaction && interaction.user.id !== this.UserId) return
    // this.log("[messageCreate]", JSON.stringify(message));
    await this.messageCreate(message)
  }

  private async onMessageUpdate(message: any) {
    const { channel_id, author, interaction } = message
    if (channel_id !== this.config.ChannelId) return
    if (author?.id !== this.config.BotId) return
    if (interaction && interaction.user.id !== this.UserId) return
    // this.log("[messageUpdate]", JSON.stringify(message));
    this.messageUpdate(message)
  }
  private async onMessageDelete(message: any) {
    const { channel_id, id } = message
    if (channel_id !== this.config.ChannelId) return
    for (const [key, value] of this.waitMjEvents.entries()) {
      if (value.id === id) {
        this.waitMjEvents.set(key, { ...value, del: true })
      }
    }
  }

  // parse message from ws
  private parseMessage(data: string) {
    const msg = JSON.parse(data)
    if (!msg.t) {
      return
    }
    const message = msg.d
    if (message.channel_id === this.config.ChannelId) {
      this.log(data)
    }
    this.log('event', msg.t)
    switch (msg.t) {
      case 'READY':
        this.emitSystem('ready', message.user)
        break
      case 'MESSAGE_CREATE':
        this.emitSystem('messageCreate', message)
        break
      case 'MESSAGE_UPDATE':
        this.emitSystem('messageUpdate', message)
        break
      case 'MESSAGE_DELETE':
        this.emitSystem('messageDelete', message)
        break
      case 'INTERACTION_SUCCESS':
        if (message.nonce) {
          this.emitSystem('interactionSuccess', message)
        }
        break
      case 'INTERACTION_CREATE':
        if (message.nonce) {
          this.emitSystem('interactionCreate', message)
        }
        break
      case 'INTERACTION_FAILURE':
        this.log('Interaction failed', message.reason_code, message)
        if (this.getEventByNonce(message.nonce)) {
          const eventMsg: MJEmit = {
            error: new Error(
              `This prompt is too big or too difficult. reason_code: ${message.reason_code}`,
            ),
          }
          this.emit(this.getEventByNonce(message.nonce)?.nonce!, eventMsg)
        }
        break
    }
  }
  //continue click appeal or Acknowledged
  private async continue(message: any) {
    const { components, id, flags, nonce } = message
    const appeal = components[0]?.components[0]
    await this.log('appeal', appeal)
    if (appeal) {
      const newnonce = nextNonce()
      const httpStatus = await this.MJApi.CustomApi({
        msgId: id,
        customId: appeal.custom_id,
        flags,
        nonce: newnonce,
      })
      await this.log('appeal.httpStatus', httpStatus)
      if (httpStatus == 204) {
        //todo
        this.on(newnonce, (data) => {
          this.emit(nonce, data)
        })
      }
    }
  }
  private async verifyHuman(message: any) {
    const { HuggingFaceToken } = this.config
    if (HuggingFaceToken === '' || !HuggingFaceToken) {
      await this.log('HuggingFaceToken is empty')
      return
    }
    const { embeds, components, id, flags, nonce } = message
    const uri = embeds[0].image?.url
    const categories = components[0].components
    const classify = categories.map((c: any) => c.label)
    const verifyClient = new VerifyHuman(this.config)
    const category = await verifyClient.verify(uri, classify)
    if (category) {
      const custom_id = categories.find((c: any) => c.label === category).custom_id
      const newnonce = nextNonce()
      const httpStatus = await this.MJApi.CustomApi({
        msgId: id,
        customId: custom_id,
        flags,
        nonce: newnonce,
      })
      if (httpStatus == 204) {
        this.on(newnonce, (data) => {
          this.emit(nonce, data)
        })
      }
      await this.log('verifyHumanApi', httpStatus, custom_id, message.id)
    }
  }
  private EventError(id: string, error: Error) {
    const event = this.getEventById(id)
    if (!event) {
      return
    }
    const eventMsg: MJEmit = {
      error,
    }
    this.emit(event.nonce, eventMsg)
  }

  private done(message: any) {
    const { content, id, attachments, components, flags } = message
    const { proxy_url, width, height } = attachments[0]
    let { url } = attachments[0]

    if (this.config.ImageProxy !== '') {
      url = url.replace('https://cdn.discordapp.com/', this.config.ImageProxy)
    }

    const MJmsg: MJMessage = {
      id,
      flags,
      content,
      hash: uriToHash(url),
      progress: 'done',
      url,
      proxy_url,
      options: formatOptions(components),
      width,
      height,
    }
    this.filterMessages(MJmsg)
    return
  }
  private processingImage(message: any) {
    const { content, id, attachments, flags } = message
    if (!content) {
      return
    }
    const event = this.getEventById(id)
    if (!event) {
      return
    }

    event.prompt = content

    let url: string | undefined = attachments?.[0]?.url
    const proxy_url: string | undefined = attachments?.[0]?.proxy_url
    const progress: `${number}%` | 'done' = content2progress(content)

    if (url) {
      if (this.config.ImageProxy !== '') {
        url = url?.replace('https://cdn.discordapp.com/', this.config.ImageProxy)
      }
    }

    if (progress === 'done' && !url) return

    const MJmsg: MJMessage = {
      url: url!,
      proxy_url,
      content: content,
      flags: flags,
      progress: progress,
    }
    const eventMsg: MJEmit = {
      message: MJmsg,
    }
    this.emitImage(event.nonce, eventMsg)
  }

  private async filterMessages(MJmsg: MJMessage) {
    // delay 300ms for discord message delete
    await this.timeout(300)
    const event = this.getEventByContent(MJmsg.content)
    if (!event) {
      await this.log('FilterMessages not found', MJmsg, this.waitMjEvents)
      return
    }
    const eventMsg: MJEmit = {
      message: MJmsg,
    }
    this.emitImage(event.nonce, eventMsg)
  }
  private getEventByContent(content: string) {
    const prompt = content2prompt(content)
    //fist del message
    for (const [_, value] of this.waitMjEvents.entries()) {
      if (value.del === true && prompt === content2prompt(value.prompt as string)) {
        return value
      }
    }

    for (const [_, value] of this.waitMjEvents.entries()) {
      if (prompt === content2prompt(value.prompt as string)) {
        return value
      }
    }
  }

  private getEventById(id: string) {
    for (const [_, value] of this.waitMjEvents.entries()) {
      if (value.id === id) {
        return value
      }
    }
  }
  private getEventByNonce(nonce: string) {
    for (const [_, value] of this.waitMjEvents.entries()) {
      if (value.nonce === nonce) {
        return value
      }
    }
  }
  private updateMjEventIdByNonce(id: string, nonce: string) {
    if (nonce === '' || id === '') return
    const event = this.waitMjEvents.get(nonce)
    if (!event) return
    event.id = id
    this.log('updateMjEventIdByNonce success', this.waitMjEvents.get(nonce))
  }

  protected async log(...args: any[]) {
    this.config.Debug && console.info(...args, new Date().toISOString())
  }

  emit(event: string, message: any) {
    this.event.filter((e) => e.event === event).forEach((e) => e.callback(message))
  }
  private emitImage(type: string, message: MJEmit) {
    this.emit(type, message)
  }
  //FIXME: emitMJ rename
  private emitMJ(id: string, data: any) {
    const event = this.getEventById(id)
    if (!event) return
    this.emit(event.nonce, data)
  }

  on(event: string, callback: (message: any) => void) {
    this.event.push({ event, callback })
  }
  onSystem(
    event:
      | 'ready'
      | 'messageCreate'
      | 'messageUpdate'
      | 'messageDelete'
      | 'interactionCreate'
      | 'interactionSuccess',
    callback: (message: any) => void,
  ) {
    this.on(event, callback)
  }
  private emitSystem(
    type:
      | 'ready'
      | 'messageCreate'
      | 'messageUpdate'
      | 'messageDelete'
      | 'interactionSuccess'
      | 'interactionCreate',
    message: MJEmit,
  ) {
    this.emit(type, message)
  }
  once(event: string, callback: (message: any) => void) {
    const once = (message: any) => {
      this.remove(event, once)
      callback(message)
    }
    this.event.push({ event, callback: once })
  }
  remove(event: string, callback: (message: any) => void) {
    this.event = this.event.filter((e) => e.event !== event && e.callback !== callback)
  }
  removeEvent(event: string) {
    this.event = this.event.filter((e) => e.event !== event)
  }
  //FIXME: USE ONCE
  onceInfo(callback: (message: any) => void) {
    const once = (message: any) => {
      this.remove('info', once)
      callback(message)
    }
    this.event.push({ event: 'info', callback: once })
  }
  //FIXME: USE ONCE
  onceSettings(callback: (message: any) => void) {
    const once = (message: any) => {
      this.remove('settings', once)
      callback(message)
    }
    this.event.push({ event: 'settings', callback: once })
  }
  onceMJ(nonce: string, callback: (data: any) => void) {
    const once = (message: any) => {
      this.remove(nonce, once)
      //FIXME: removeWaitMjEvent
      this.removeWaitMjEvent(nonce)
      callback(message)
    }
    //FIXME: addWaitMjEvent
    this.waitMjEvents.set(nonce, { nonce })
    this.event.push({ event: nonce, callback: once })
  }
  private removeSkipMessageId(messageId: string) {
    const index = this.skipMessageId.findIndex((id) => id !== messageId)
    if (index !== -1) {
      this.skipMessageId.splice(index, 1)
    }
  }
  private removeWaitMjEvent(nonce: string) {
    this.waitMjEvents.delete(nonce)
  }
  onceImage(nonce: string, callback: (data: MJEmit) => void) {
    const once = (data: MJEmit) => {
      const { message, error } = data
      if (error || (message && message.progress === 'done')) {
        this.remove(nonce, once)
      }
      callback(data)
    }
    this.event.push({ event: nonce, callback: once })
  }

  async waitImageMessage({
    nonce,
    prompt,
    onmodal,
    messageId,
    loading,
  }: {
    nonce: string
    prompt?: string
    messageId?: string
    onmodal?: OnModal
    loading?: LoadingHandler
  }) {
    if (messageId) this.skipMessageId.push(messageId)
    return new Promise<MJMessageDone | null>((resolve, reject) => {
      const handleImageMessage = ({ message, error }: MJEmit) => {
        if (error) {
          this.removeWaitMjEvent(nonce)
          reject(error)
          return
        }
        if (message && message.progress === 'done') {
          this.removeWaitMjEvent(nonce)
          messageId && this.removeSkipMessageId(messageId)
          resolve(message)
          return
        }
        message && loading && loading({ url: message?.url, progress: message.progress || '0%' })
      }
      this.waitMjEvents.set(nonce, {
        nonce,
        prompt,
        onmodal: async (oldnonce, id) => {
          if (onmodal === undefined) {
            // reject(new Error("onmodal is not defined"))
            return ''
          }
          const nonce = await onmodal(oldnonce, id)
          if (nonce === '') {
            // reject(new Error("onmodal return empty nonce"))
            return ''
          }
          this.removeWaitMjEvent(oldnonce)
          this.waitMjEvents.set(nonce, { nonce })
          this.onceImage(nonce, handleImageMessage)
          return nonce
        },
      })
      this.onceImage(nonce, handleImageMessage)
    })
  }
  async waitDescribe(nonce: string) {
    return new Promise<MJDescribe | null>((resolve) => {
      this.onceMJ(nonce, (message) => {
        resolve(message)
      })
    })
  }
  async waitShorten(nonce: string) {
    return new Promise<MJShorten | null>((resolve) => {
      this.onceMJ(nonce, (message) => {
        resolve(message)
      })
    })
  }
  async waitContent(event: string) {
    return new Promise<string | null>((resolve) => {
      this.once(event, (message) => {
        resolve(message)
      })
    })
  }
  async waitInfo() {
    return new Promise<MJInfo | null>((resolve, _) => {
      this.onceInfo((message) => {
        resolve(formatInfo(message))
      })
    })
  }
  async waitSettings() {
    return new Promise<MJSettings | null>((resolve, _) => {
      this.onceSettings((message) => {
        resolve({
          id: message.id,
          flags: message.flags,
          content: message,
          options: formatOptions(message.components),
        })
      })
    })
  }
}
