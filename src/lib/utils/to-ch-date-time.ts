export function toCHDateTime(date: Date | string): string {
  return new Date(date).toISOString().slice(0, 19).replace('T', ' ')
}
