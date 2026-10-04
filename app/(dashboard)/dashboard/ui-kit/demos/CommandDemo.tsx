'use client'

import { CreditCard, Hash, Search, Settings, User } from 'lucide-react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'

export default function CommandDemo() {
  return (
    <Command className="rounded-lg border shadow-sm">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem value="calendar"><Hash className="mr-2 size-4" />Calendar</CommandItem>
          <CommandItem value="search"><Search className="mr-2 size-4" />Search Emoji</CommandItem>
          <CommandItem value="calculator"><CreditCard className="mr-2 size-4" />Calculator</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Settings">
          <CommandItem value="profile"><User className="mr-2 size-4" />Profile</CommandItem>
          <CommandItem value="billing"><CreditCard className="mr-2 size-4" />Billing</CommandItem>
          <CommandItem value="settings"><Settings className="mr-2 size-4" />Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
