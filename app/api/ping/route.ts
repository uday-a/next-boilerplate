import { apiHandler } from '@/lib/api/response'

export async function GET() {
  return apiHandler(async () => ({ pong: true }))
}