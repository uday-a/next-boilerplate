/** Sample roles and permissions for the Admin → Roles page (no backend). */

export type RoleId = 'owner' | 'admin' | 'editor' | 'viewer' | 'billing'

export interface Role {
  id: RoleId
  name: string
  description: string
  members: number
  /** System roles can't be edited (Owner always has everything). */
  locked?: boolean
}

export interface Permission {
  id: string
  label: string
  description: string
  /** Destructive or security-sensitive — flagged in the matrix. */
  risky?: boolean
}

export interface PermissionGroup {
  id: string
  label: string
  permissions: Permission[]
}

// Member counts add up to the 8 people in the Team settings sample.
export const roles: Role[] = [
  { id: 'owner', name: 'Owner', description: 'Full access, including deleting the workspace.', members: 1, locked: true },
  { id: 'admin', name: 'Admin', description: 'Manages people, settings and security.', members: 1 },
  { id: 'editor', name: 'Editor', description: 'Creates and edits projects and customers.', members: 2 },
  { id: 'viewer', name: 'Viewer', description: 'Read-only access to workspace data.', members: 3 },
  { id: 'billing', name: 'Billing', description: 'Handles plans, invoices and payment.', members: 1 },
]

export const permissionGroups: PermissionGroup[] = [
  {
    id: 'projects',
    label: 'Projects',
    permissions: [
      { id: 'projects.view', label: 'View projects', description: 'See projects and their tasks.' },
      { id: 'projects.create', label: 'Create projects', description: 'Start new projects.' },
      { id: 'projects.edit', label: 'Edit projects', description: 'Change names, members and settings.' },
      { id: 'projects.delete', label: 'Delete projects', description: 'Permanently remove a project.', risky: true },
    ],
  },
  {
    id: 'customers',
    label: 'Customers',
    permissions: [
      { id: 'customers.view', label: 'View customers', description: 'See accounts, plans and activity.' },
      { id: 'customers.edit', label: 'Edit customers', description: 'Update account details and plans.' },
      { id: 'customers.export', label: 'Export customers', description: 'Download customer data as CSV.', risky: true },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    permissions: [
      { id: 'billing.invoices', label: 'View invoices', description: 'See and download past invoices.' },
      { id: 'billing.plan', label: 'Change plan', description: 'Upgrade, downgrade or cancel.' },
      { id: 'billing.payment', label: 'Update payment method', description: 'Change the card on file.' },
    ],
  },
  {
    id: 'team',
    label: 'Team',
    permissions: [
      { id: 'team.view', label: 'View members', description: 'See who is in the workspace.' },
      { id: 'team.invite', label: 'Invite members', description: 'Send invitations by email.' },
      { id: 'team.roles', label: 'Change roles', description: 'Assign roles to other members.', risky: true },
      { id: 'team.remove', label: 'Remove members', description: 'Revoke a member’s access.', risky: true },
    ],
  },
  {
    id: 'api',
    label: 'API keys',
    permissions: [
      { id: 'api.view', label: 'View API keys', description: 'See key names, scopes and last use.' },
      { id: 'api.create', label: 'Create API keys', description: 'Issue new scoped keys.' },
      { id: 'api.revoke', label: 'Revoke API keys', description: 'Disable a key immediately.', risky: true },
    ],
  },
  {
    id: 'settings',
    label: 'Workspace',
    permissions: [
      { id: 'settings.view', label: 'View settings', description: 'See workspace configuration.' },
      { id: 'settings.edit', label: 'Edit settings', description: 'Change name, URL and branding.' },
      { id: 'settings.integrations', label: 'Manage integrations', description: 'Connect and disconnect apps.' },
    ],
  },
  {
    id: 'security',
    label: 'Security',
    permissions: [
      { id: 'security.audit', label: 'View audit log', description: 'See who did what, and when.' },
      { id: 'security.sso', label: 'Manage SSO', description: 'Configure single sign-on and SCIM.', risky: true },
      { id: 'security.mfa', label: 'Enforce two-factor', description: 'Require 2FA for every member.', risky: true },
    ],
  },
]

export const allPermissionIds = permissionGroups.flatMap((g) => g.permissions.map((p) => p.id))

const viewAll = allPermissionIds.filter((id) => /\.(view|invoices|audit)$/.test(id))

/** Saved grants per role — the baseline the matrix diffs against. */
export const defaultGrants: Record<RoleId, string[]> = {
  owner: [...allPermissionIds],
  admin: allPermissionIds.filter((id) => !id.startsWith('billing.plan') && id !== 'billing.payment'),
  editor: [...viewAll.filter((id) => !id.startsWith('security')), 'projects.create', 'projects.edit', 'customers.edit', 'api.create'],
  viewer: viewAll.filter((id) => !id.startsWith('security') && !id.startsWith('billing')),
  billing: ['billing.invoices', 'billing.plan', 'billing.payment', 'team.view', 'settings.view'],
}
