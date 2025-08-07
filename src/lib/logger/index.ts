import { config } from '@/config'
import chalk from 'chalk'
import winston from 'winston'
import 'winston-daily-rotate-file'

export const logger = winston.createLogger({
  level: config.logs.level,
  transports: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: '%DATE%.log',
      dirname: 'logs',
      maxFiles: '7d',
    }),
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple(),
  ),
})

export const log = (...params: any[]) => console.log(chalk.blue.bold('[Bothub Server]'), ...params)

export const logMemoryUsage = (label: string) => {
  const used = process.memoryUsage()
  logger.info({
    message: label,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`, // Your app data
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`, // V8 reserved
    rss: `${Math.round(used.rss / 1024 / 1024)} MB`, // Total process size
  })
}
