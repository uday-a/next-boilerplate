'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SwitchProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>, 'children'> {
  size?: 'sm' | 'default' | 'lg'
  /** Text shown on the left side when checked. */
  checkedChildren?: React.ReactNode
  /** Text shown on the right side when unchecked. */
  unCheckedChildren?: React.ReactNode
  loading?: boolean
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | string
  /** Custom content rendered inside the thumb. Receives the checked state. */
  thumb?: (state: { checked: boolean }) => React.ReactNode
}

const colorMap: Record<string, string> = {
  primary: 'var(--primary)',
  secondary: 'var(--secondary)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  error: 'var(--destructive)',
  info: 'var(--info)',
}

const thumbSizes = {
  sm: 'size-3',
  default: 'size-4',
  lg: 'size-5',
}

const thumbTranslate = {
  sm: 'data-[state=checked]:translate-x-[calc(100%-2px)]',
  default: 'data-[state=checked]:translate-x-[calc(100%-2px)]',
  lg: 'data-[state=checked]:translate-x-[calc(100%-5px)]',
}

const textSizes = {
  sm: 'text-[7px]',
  default: 'text-xs',
  lg: 'text-xs',
}

const thumbIconSizes = {
  sm: 'size-2',
  default: 'size-2.5',
  lg: 'size-3',
}

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(
  (
    {
      className,
      style,
      size = 'default',
      checkedChildren,
      unCheckedChildren,
      loading,
      color,
      disabled,
      thumb,
      checked,
      defaultChecked,
      onCheckedChange,
      ...props
    },
    ref,
  ) => {
    // Track checked state so children-visibility / thumb slot can react in both
    // controlled and uncontrolled usage (Radix doesn't surface checked to children).
    const [internalChecked, setInternalChecked] = React.useState<boolean>(defaultChecked ?? false)
    const isControlled = checked !== undefined
    const isChecked = isControlled ? !!checked : internalChecked

    const handleChange = React.useCallback(
      (next: boolean) => {
        if (!isControlled) setInternalChecked(next)
        onCheckedChange?.(next)
      },
      [isControlled, onCheckedChange],
    )

    const hasChildren = Boolean(checkedChildren || unCheckedChildren)

    const height = {
      sm: 'h-4',
      default: 'h-[1.15rem]',
      lg: 'h-6',
    }[size]

    const width = hasChildren
      ? {
          sm: 'min-w-8 w-fit',
          default: 'min-w-10 w-fit',
          lg: 'min-w-[3.25rem] w-fit',
        }[size]
      : {
          sm: 'w-6',
          default: 'w-8',
          lg: 'w-11',
        }[size]

    const sizeClasses = `${height} ${width}`

    const trackStyle = {
      ...style,
      '--switch-checked-bg': color ? colorMap[color] || color : 'var(--primary)',
    } as React.CSSProperties

    return (
      <SwitchPrimitive.Root
        ref={ref}
        data-slot="switch"
        disabled={disabled || loading}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={handleChange}
        className={cn(
          'peer focus-visible:ring-ring/50 focus-visible:border-ring data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80 relative inline-flex shrink-0 items-center overflow-hidden rounded-full border border-transparent shadow-xs transition-[background-color,border-color,box-shadow] duration-150 outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[var(--switch-checked-bg)]',
          sizeClasses,
          className,
        )}
        style={trackStyle}
        {...props}
      >
        {/* Checked children (left side, visible when checked) */}
        {hasChildren && (
          <div
            className={cn(
              'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-1 transition-opacity duration-150',
              isChecked ? 'opacity-100' : 'opacity-0',
              textSizes[size],
            )}
          >
            <span className="text-primary-foreground truncate font-medium">{checkedChildren}</span>
          </div>
        )}

        {/* Unchecked children (right side, visible when unchecked) */}
        {hasChildren && (
          <div
            className={cn(
              'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1 transition-opacity duration-150',
              !isChecked ? 'opacity-100' : 'opacity-0',
              textSizes[size],
            )}
          >
            <span className="text-muted-foreground truncate font-medium">{unCheckedChildren}</span>
          </div>
        )}

        <SwitchPrimitive.Thumb
          data-uipkge=""
          data-slot="switch-thumb"
          className={cn(
            'bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none z-10 block rounded-full ring-0 transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] data-[state=unchecked]:translate-x-0',
            thumbSizes[size],
            thumbTranslate[size],
          )}
        >
          {loading ? (
            <Loader2 className={cn(thumbIconSizes[size], 'text-muted-foreground animate-spin')} />
          ) : (
            thumb?.({ checked: isChecked })
          )}
        </SwitchPrimitive.Thumb>
      </SwitchPrimitive.Root>
    )
  },
)
Switch.displayName = 'Switch'

export { Switch }
