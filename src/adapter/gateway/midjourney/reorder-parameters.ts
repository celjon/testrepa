const supportedParameters: Record<
  string,
  {
    argsCount: number
  }
> = {
  '--aspect': {
    argsCount: 1,
  },
  '--ar': {
    argsCount: 1,
  },
  '--chaos': {
    argsCount: 1,
  },
  '--c': {
    argsCount: 1,
  },
  '--oref': {
    argsCount: 1,
  },
  '--no': {
    argsCount: Infinity,
  },
  '--profile': {
    argsCount: 1,
  },
  '--p': {
    argsCount: 1,
  },
  '--quality': {
    argsCount: 1,
  },
  '--q': {
    argsCount: 1,
  },
  '--repeat': {
    argsCount: 1,
  },
  '--r': {
    argsCount: 1,
  },
  '--seed': {
    argsCount: 1,
  },
  '--raw': {
    argsCount: 0,
  },
  '--stylize': {
    argsCount: 1,
  },
  '--s': {
    argsCount: 1,
  },
  '--sref': {
    argsCount: 1,
  },
  '--sw': {
    argsCount: 1,
  },
  '--sv': {
    argsCount: 1,
  },
  '--cref': {
    argsCount: 1,
  },
  '--cw': {
    argsCount: 1,
  },
  '--tile': {
    argsCount: 0,
  },
  '--version': {
    argsCount: 1,
  },
  '--v': {
    argsCount: 1,
  },
  '--draft': {
    argsCount: 0,
  },
  '--weird': {
    argsCount: 1,
  },
  '--w': {
    argsCount: 1,
  },
  '--iw': {
    argsCount: 1,
  },
  '--fast': {
    argsCount: 0,
  },
  '--relax': {
    argsCount: 0,
  },
  '--turbo': {
    argsCount: 0,
  },
  '--niji': {
    argsCount: 1,
  },
  '--style': {
    argsCount: 1,
  },
  '--stealth': {
    argsCount: 0,
  },
  '--public': {
    argsCount: 0,
  },
}

const invalidCharAtEnd = /,|\.|"|'|\*$/
const negativeNumberPattern = /^-\d+(\.\d+)?%?$/

const isLikeNumber = (token: string) => negativeNumberPattern.test(token)

const isLikeParameter = (token: string) =>
  (token.startsWith('--') && token.length > 2) ||
  (token.startsWith('-') && !token.startsWith('--') && token.length > 1) ||
  (token.startsWith('—') && !token.startsWith('--') && token.length > 1)

export const reorderParameters = (prompt: string) => {
  const tokens = prompt.trim().split(/\s+/)
  const keptWords = []
  const foundParams: [string, string[]][] = []

  let i = 0
  while (i < tokens.length) {
    const token = tokens[i]

    if (isLikeNumber(token) || token === '-') {
      keptWords.push(`"${token}"`)
      i++
      continue
    }

    let lowerCasedToken = token.toLowerCase().replace(/^—/, '--')

    if (lowerCasedToken.startsWith('-') && !lowerCasedToken.startsWith('--')) {
      lowerCasedToken = lowerCasedToken.replace(/^-/, '--')
    }

    if (isLikeParameter(lowerCasedToken)) {
      const parameter = supportedParameters[lowerCasedToken]

      if (parameter) {
        const argsCount = parameter.argsCount ?? 0
        const args = []
        i++
        if (argsCount === Infinity) {
          // grab until next parameter or end
          while (i < tokens.length && !isLikeParameter(tokens[i])) {
            args.push(tokens[i].replace(invalidCharAtEnd, ''))
            i++
          }
        } else {
          // grab up to argsCount, stopping early if we hit another parameter
          for (let argIdx = 0; argIdx < argsCount && i < tokens.length; argIdx++) {
            if (isLikeParameter(tokens[i])) {
              break
            }
            args.push(tokens[i].replace(invalidCharAtEnd, ''))
            i++
          }
        }
        foundParams.push([lowerCasedToken, args])
        continue
      } else {
        // unsupported parameter: skip it
        let escapedToken = token

        if (token.startsWith('-') || token.startsWith('--') || token.startsWith('—')) {
          escapedToken = `"${escapedToken}"`
        }

        keptWords.push(escapedToken)
        i++
        continue
      }
    }

    keptWords.push(token)
    i++
  }

  const deduped: [string, string[]][] = []
  const seen = new Set()
  for (let j = foundParams.length - 1; j >= 0; j--) {
    const [paremeter, args] = foundParams[j]
    if (!seen.has(paremeter)) {
      seen.add(paremeter)
      deduped.push([paremeter, args])
    }
  }
  deduped.reverse()

  const tail: string[] = []
  deduped.forEach(([flag, args]) => {
    tail.push(flag, ...args)
  })

  const base = keptWords.join(' ')
  if (tail.length) {
    return base + ' ' + tail.join(' ')
  }
  return base
}
