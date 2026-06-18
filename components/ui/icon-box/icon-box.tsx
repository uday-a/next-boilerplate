import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface IconBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lucide icon component rendered inside the box. */
  icon: LucideIcon
  variant?: 'primary' | 'muted' | 'custom'
  shape?: 'rounded' | 'circle'
  size?: 'sm' | 'md' | 'lg'
  iconClassName?: string
}

const variantClasses: Record<string, string> = {
  primary: 'bg-primary/10 text-primary',
  muted: 'bg-muted text-muted-foreground',
  custom: '',
}

const shapeClasses: Record<string, string> = {
  rounded: 'rounded-lg',
  circle: 'rounded-full',
}

const sizeClasses: Record<string, string> = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-3',
}

const iconSizes: Record<string, string> = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-6',
}

const IconBox = React.forwardRef<HTMLDivElement, IconBoxProps>(
  ({ className, icon: Icon, variant = 'primary', shape = 'rounded', size = 'md', iconClassName, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('shrink-0', variantClasses[variant], shapeClasses[shape], sizeClasses[size], className)}
      {...props}
    >
      <Icon className={cn(iconSizes[size], iconClassName)} />
    </div>
  ),
)
IconBox.displayName = 'IconBox'

export { IconBox }
