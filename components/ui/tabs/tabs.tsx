'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'
import { tabsListVariants, tabsTriggerVariants } from './tabs.variants'

// Make orientation reachable from descendants without each consumer having to
// pass it manually. TabsList / TabsTrigger read this to apply variant CSS.
const TabsOrientationContext = React.createContext<'horizontal' | 'vertical'>('horizontal')

export interface TabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  orientation?: 'horizontal' | 'vertical'
}

const Tabs = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Root>, TabsProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => (
    <TabsOrientationContext.Provider value={orientation}>
      <TabsPrimitive.Root
        ref={ref}
        data-uipkge=""
        data-slot="tabs"
        data-orientation={orientation}
        orientation={orientation}
        className={cn('flex w-full', orientation === 'vertical' ? 'flex-row gap-4' : 'flex-col gap-2', className)}
        {...props}
      />
    </TabsOrientationContext.Provider>
  ),
)
Tabs.displayName = 'Tabs'

export interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  variant?: 'segmented' | 'pill' | 'underline'
  orientation?: 'horizontal' | 'vertical'
}

const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, variant, orientation, ...props }, ref) => {
    const inherited = React.useContext(TabsOrientationContext)
    const effectiveOrientation = orientation ?? inherited
    return (
      <TabsPrimitive.List
        ref={ref}
        data-uipkge=""
        data-slot="tabs-list"
        className={cn(tabsListVariants({ variant, orientation: effectiveOrientation }), className)}
        {...props}
      />
    )
  },
)
TabsList.displayName = 'TabsList'

export interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  size?: 'default' | 'sm' | 'lg'
  variant?: 'segmented' | 'pill' | 'underline'
  orientation?: 'horizontal' | 'vertical'
}

const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, TabsTriggerProps>(
  ({ className, size, variant, orientation, ...props }, ref) => {
    const inherited = React.useContext(TabsOrientationContext)
    const effectiveOrientation = orientation ?? inherited
    return (
      <TabsPrimitive.Trigger
        ref={ref}
        data-uipkge=""
        data-slot="tabs-trigger"
        className={cn(
          tabsTriggerVariants({ size, variant, orientation: effectiveOrientation }),
          className,
        )}
        {...props}
      />
    )
  },
)
TabsTrigger.displayName = 'TabsTrigger'

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    data-uipkge=""
    data-slot="tabs-content"
    className={cn(
      'ring-offset-background focus-visible:border-ring focus-visible:ring-ring/50 flex-1 focus-visible:ring-2 focus-visible:ring-[3px] focus-visible:outline-none',
      className,
    )}
    {...props}
  />
))
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }
