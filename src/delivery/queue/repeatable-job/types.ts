export type RepeatableJobHandler = () => Promise<void>

export type Scheduler = (
  params: {
    cronExpression: string
    jobId: string
  },
  handler: RepeatableJobHandler,
) => void
