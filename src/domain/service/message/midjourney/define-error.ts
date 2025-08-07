export const ErrorType = {
  INVALID_PROMPT: 'INVALID_PROMPT',
  PLAN_LIMIT_REACHED: 'PLAN_LIMIT_REACHED',
  USER_BLOCKED: 'USER_BLOCKED',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  TIMEOUT_EXCEEDED: 'TIMEOUT_EXCEEDED',
  MODERATION_FAILED: 'MODERATION_FAILED',
  MJ_7_ERROR: 'MJ_7_ERROR',
} as const

export type DefineError = (params: { errorMessage: string }) => keyof typeof ErrorType

export const buildDefineError = (): DefineError => {
  return ({ errorMessage }) => {
    const ERROR_MESSAGES: { [key in keyof typeof ErrorType]: string[] } = {
      [ErrorType.MODERATION_FAILED]: ['AI moderator'],
      [ErrorType.MJ_7_ERROR]: ['Your unique trace'],
      [ErrorType.UNKNOWN_ERROR]: ['V7 is the first'],
      [ErrorType.INVALID_PROMPT]: [
        'Unrecognized parameter(s)',
        'personalization',
        'Prompts starting with',
        'Cannot use',
        'Invalid',
        'compatible',
        'prompt',
        'Prompt',
        'Could not fetch image',
        'content type',
        'argument',
        'Request cancelled',
        'validate',
        'Payload Too Large',
        'URL',
      ],
      [ErrorType.PLAN_LIMIT_REACHED]: ['run out of hours', 'fast hours', 'relax mode'],
      [ErrorType.USER_BLOCKED]: ['blocked from accessing Midjourney', 'ToS violations'],
      [ErrorType.INVALID_RESPONSE]: ['Unexpected end of JSON input', 'JSON parsing error'],
      [ErrorType.TIMEOUT_EXCEEDED]: ['Timeout of'],
    }

    for (const [errorType, messages] of Object.entries(ERROR_MESSAGES)) {
      if (messages.some((msg) => errorMessage.includes(msg))) {
        return errorType as keyof typeof ErrorType
      }
    }

    return ErrorType.UNKNOWN_ERROR
  }
}
