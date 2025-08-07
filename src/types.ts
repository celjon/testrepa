export enum InClusterMessageAction {
  STOP = 'stop',
}

export type InClusterMessage = {
  action: InClusterMessageAction
  payload?: any
}
