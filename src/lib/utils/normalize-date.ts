// resets hours, minutes, seconds, milliseconds in data,
// so returned date points to the beginning of the day
export const normalizeDate = (date: Date): Date => {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0),
  )
}
