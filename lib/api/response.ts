import { NextResponse } from 'next/server'

export const ErrorCode = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  SESSION_INVALID: 'SESSION_INVALID',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL: 'INTERNAL',
} as const
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]

const CODE_TO_STATUS: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  SESSION_INVALID: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_FAILED: 422,
  RATE_LIMITED: 429,
  INTERNAL: 500,
}

export interface ApiSuccess<T> {
  ok: true
  data: T
}
export interface ApiFailure {
  ok: false
  error: { code: ErrorCode; message: string; details?: unknown }
}
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export function ok<T>(data: T): ApiSuccess<T> {
  return { ok: true, data }
}

export class ApiError extends Error {
  code: ErrorCode
  status: number
  details?: unknown

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message)
    this.code = code
    this.status = CODE_TO_STATUS[code]
    this.details = details
  }
}

export function apiError(code: ErrorCode, message: string, details?: unknown) {
  return new ApiError(code, message, details)
}

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(ok(data), init)
}

export function jsonError(err: unknown) {
  if (err instanceof ApiError) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: err.code,
          message: err.message,
          ...(err.details !== undefined ? { details: err.details } : {}),
        },
      },
      { status: err.status },
    )
  }
  const message = err instanceof Error ? err.message : 'Internal error'
  return NextResponse.json(
    { ok: false, error: { code: ErrorCode.INTERNAL, message } },
    { status: 500 },
  )
}

export async function apiHandler<T>(fn: () => Promise<T>) {
  try {
    const data = await fn()
    return jsonOk(data)
  } catch (err) {
    return jsonError(err)
  }
}