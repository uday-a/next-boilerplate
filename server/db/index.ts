import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import { env } from '@/lib/env'

let client: ReturnType<typeof postgres> | undefined
let db: ReturnType<typeof drizzle<typeof schema>> | undefined

export function getDb() {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured')
  }
  if (!db) {
    client = postgres(env.DATABASE_URL, { prepare: false })
    db = drizzle(client, { schema })
  }
  return db
}

export { schema }