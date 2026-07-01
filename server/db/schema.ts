import { boolean, integer, pgEnum, pgTable, serial, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core'

export const userRole = pgEnum('user_role', ['user', 'admin', 'editor'])
export type Role = (typeof userRole.enumValues)[number]
export const ROLES: readonly Role[] = userRole.enumValues

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 256 }).notNull(),
    githubId: integer('github_id').unique(),
    login: varchar('login', { length: 64 }).notNull(),
    name: varchar('name', { length: 128 }),
    avatarUrl: text('avatar_url'),
    role: userRole('role').notNull().default('user'),
    bio: varchar('bio', { length: 500 }),
    timezone: varchar('timezone', { length: 64 }).notNull().default('UTC'),
    locale: varchar('locale', { length: 8 }).notNull().default('en'),
    notifyEmail: boolean('notify_email').notNull().default(true),
    notifyInApp: boolean('notify_in_app').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('users_email_unique').on(t.email)],
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  name: varchar('name', { length: 128 }).notNull(),
  description: text('description'),
  ownerId: integer('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  polarCustomerId: varchar('polar_customer_id', { length: 64 }).notNull(),
  polarSubscriptionId: varchar('polar_subscription_id', { length: 64 }).notNull().unique(),
  productId: varchar('product_id', { length: 64 }).notNull(),
  status: varchar('status', { length: 32 }).notNull(),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  canceledAt: timestamp('canceled_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert

export const magicLinkTokens = pgTable('magic_link_tokens', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 256 }).notNull(),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})