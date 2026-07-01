'use client'

import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/use-kanban'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const userAvatarSizeMap = {
  xs: { avatar: 'size-6', text: 'text-[8px]' },
  sm: { avatar: 'size-7', text: 'text-[9px]' },
  md: { avatar: 'size-8', text: 'text-[11px]' },
}

export function UserAvatar({
  name,
  color,
  size = 'sm',
  className,
}: {
  name: string
  color: string
  size?: 'xs' | 'sm' | 'md'
  className?: string
}) {
  return (
    <Avatar className={cn(userAvatarSizeMap[size].avatar, 'shrink-0', className)}>
      <AvatarFallback className={cn(userAvatarSizeMap[size].text, 'font-bold', color)}>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}