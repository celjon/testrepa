export const toJSONString = (value: any) => JSON.stringify(value, (key, value) => (typeof value === 'bigint' ? Number(value) : value))
