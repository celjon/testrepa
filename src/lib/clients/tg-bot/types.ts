export type TgBotClient = {
  sendMessage: (message: string, parseMode?: TgBotParseMode) => Promise<void>
}

export enum TgBotParseMode {
  MARKDOWN = 'MARKDOWN',
  HTML = 'HTML',
}
