'use client'

import * as React from 'react'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import { cn } from '@/lib/utils'
import { toggleVariants, type ToggleVariants } from '../toggle/toggle.variants'

// Make variant/size/spacing reachable from items without each consumer having
// to pass it manually — the React equivalent of the Vue provide('toggleGroup').
type ToggleGroupContextValue = {
  variant?: ToggleVariants['variant']
  size?: ToggleVariants['size']
  spacing?: number
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({})

export type ToggleGroupProps = React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
  ToggleVariants & {
    spacing?: number
  }

const ToggleGroup = React.forwardRef<React.ElementRef<typeof ToggleGroupPrimitive.Root>, ToggleGroupProps>(
  ({ className, variant, size, spacing = 0, children, ...props }, ref) => (
    <ToggleGroupPrimitive.Root
      ref={ref}
      data-uipkge=""
      data-slot="toggle-group"
      data-size={size}
      data-variant={variant}
      data-spacing={spacing}
      style={{ '--gap': spacing } as React.CSSProperties}
      className={cn(
        'group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=default]:data-[variant=outline]:shadow-xs',
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing }}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  ),
)
ToggleGroup.displayName = 'ToggleGroup'

export type ToggleGroupItemProps = React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> & ToggleVariants

const ToggleGroupItem = React.forwardRef<React.ElementRef<typeof ToggleGroupPrimitive.Item>, ToggleGroupItemProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    const context = React.useContext(ToggleGroupContext)
    return (
      <ToggleGroupPrimitive.Item
        ref={ref}
        data-uipkge=""
        data-slot="toggle-group-item"
        data-variant={context.variant || variant}
        data-size={context.size || size}
        data-spacing={context.spacing}
        className={cn(
          toggleVariants({
            variant: context.variant || variant,
            size: context.size || size,
          }),
          'w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10',
          'data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l',
          className,
        )}
        {...props}
      >
        {children}
      </ToggleGroupPrimitive.Item>
    )
  },
)
ToggleGroupItem.displayName = 'ToggleGroupItem'

export { ToggleGroup, ToggleGroupItem }
