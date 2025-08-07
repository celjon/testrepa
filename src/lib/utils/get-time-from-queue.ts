import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

export const getTimeFromQueueTime = (time: string) => {
  const date = dayjs(time, ['HH:mm:ss', 'HH'])

  return (
    date.get('hours') * 60 * 60 * 1000 +
    date.get('minutes') * 60 * 1000 +
    date.get('seconds') * 1000
  )
}
