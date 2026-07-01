import { env, hasAxiom } from '@/lib/env'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

type AxiomClient = {
  ingest(dataset: string, events: object[]): void
  flush(): Promise<void>
}

let axiomPromise: Promise<AxiomClient | null> | null = null

function getAxiom(): Promise<AxiomClient | null> {
  if (!hasAxiom) return Promise.resolve(null)
  if (!axiomPromise) {
    axiomPromise = import('@axiomhq/js').then(
      ({ Axiom }) => new Axiom({ token: env.AXIOM_TOKEN! }) as unknown as AxiomClient,
    )
  }
  return axiomPromise
}

function ship(level: LogLevel, event: string, context: Record<string, unknown>) {
  const line = `[${event}] ${JSON.stringify(context)}`
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)

  if (!hasAxiom || !env.AXIOM_DATASET) return

  void getAxiom().then((axiom) => {
    axiom?.ingest(env.AXIOM_DATASET!, [
      {
        _time: new Date().toISOString(),
        level,
        event,
        ...context,
      },
    ])
  })
}

export const logger = {
  debug: (event: string, context: Record<string, unknown> = {}) => ship('debug', event, context),
  info: (event: string, context: Record<string, unknown> = {}) => ship('info', event, context),
  warn: (event: string, context: Record<string, unknown> = {}) => ship('warn', event, context),
  error: (event: string, context: Record<string, unknown> = {}) => ship('error', event, context),
  flush: async () => {
    if (!hasAxiom) return
    const axiom = await getAxiom()
    if (axiom) await axiom.flush()
  },
}