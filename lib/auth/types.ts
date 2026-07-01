export type Role = 'user' | 'admin' | 'editor'

export interface SessionUser {
  id: number
  login: string
  name: string
  email: string
  avatar: string | null
  role: Role
}

export interface SessionData {
  user?: SessionUser
  loggedInAt?: number
  demo?: boolean
}