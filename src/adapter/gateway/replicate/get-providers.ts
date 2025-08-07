export type GetProviders = () => Promise<string[]>

export const buildGetProviders = (): GetProviders => async () => [
  'Black Forest Labs',
  'Stability AI',
]
