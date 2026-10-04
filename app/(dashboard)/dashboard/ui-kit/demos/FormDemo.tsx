'use client'

import { Button } from '@/components/ui/button'
import { FormActions, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// FormItem's `label` prop binds its <Label> to an auto-generated id, so this
// static preview renders the label row itself to keep `htmlFor` pointing at the
// input. Real forms bind fields with <Form> + <FormField>; see /dashboard/form-example.
export default function FormDemo() {
  return (
    <div className="max-w-md space-y-4">
      <FormItem description="Shown in invites and on invoices.">
        <div className="flex items-center gap-1">
          <Label htmlFor="ui-kit-form-name">Workspace name</Label>
          <span className="text-destructive text-sm">*</span>
        </div>
        <Input id="ui-kit-form-name" defaultValue="Acme Inc" />
      </FormItem>
      <FormItem status="error" help="Enter a valid email address.">
        <Label htmlFor="ui-kit-form-email">Billing email</Label>
        <Input id="ui-kit-form-email" defaultValue="billing@acme" status="error" />
      </FormItem>
      <FormActions>
        <Button variant="outline" size="sm">Cancel</Button>
        <Button size="sm">Save</Button>
      </FormActions>
    </div>
  )
}
