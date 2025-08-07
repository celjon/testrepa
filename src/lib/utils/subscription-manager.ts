export function createSubscriptionManager<T, V>(processFn: (el: T, v: V) => void) {
  const subscriptions: Record<string, Array<T>> = {}

  const subscribe = (key: string, h: T) => {
    const existing = subscriptions[key]

    if (!existing) {
      subscriptions[key] = [h]
      return
    }

    existing.push(h)
  }

  const unsubscribe = (key: string, h: T) => {
    const existing = subscriptions[key]

    if (!existing) {
      return
    }

    const index = existing.indexOf(h)

    if (index === -1) {
      return
    }

    existing.splice(index, 1)
  }

  const notify = (key: string, v: V) => {
    const existing = subscriptions[key]

    if (!existing) {
      return
    }

    for (let i = 0; i < existing.length; i++) {
      processFn(existing[i], v)
    }

    subscriptions[key] = []
  }

  return {
    unsubscribe,
    notify,
    subscribe,
  }
}
