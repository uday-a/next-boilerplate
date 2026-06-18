import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

/**
 * Variant definitions live in their own file (rather than the package
 * `index.ts`) so consuming Vue SFCs can import without creating a circular
 * dependency through the index. See card.variants.ts for the canonical
 * example + the SSR symptom that motivated the split.
 */

export const tabsListVariants = cva('inline-flex items-stretch text-muted-foreground', {
  variants: {
    variant: {
      // Solid muted track with rounded inset triggers — the default look.
      segmented: 'gap-1 rounded-md bg-muted p-1',
      // Transparent track with rounded-full pill triggers.
      pill: 'gap-2 bg-transparent p-0',
      // Bottom-border bar (horizontal) or right-border bar (vertical), with
      // an underline on the active trigger.
      underline: 'gap-0 bg-transparent p-0',
    },
    orientation: {
      horizontal: 'flex-row',
      vertical: 'h-auto flex-col items-stretch',
    },
  },
  compoundVariants: [
    {
      variant: 'underline',
      orientation: 'horizontal',
      class: 'w-full justify-start border-b border-border',
    },
    {
      variant: 'underline',
      orientation: 'vertical',
      class: 'border-r border-border',
    },
  ],
  defaultVariants: {
    variant: 'segmented',
    orientation: 'horizontal',
  },
})

export const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium ring-offset-background transition-[color,background-color,box-shadow,border-color] duration-150 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        segmented:
          'rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs',
        pill: 'rounded-full border border-border bg-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary',
        underline:
          'rounded-none border-b-2 border-transparent -mb-px data-[state=active]:border-foreground data-[state=active]:text-foreground',
      },
      size: {
        default: 'h-9 px-3 text-sm',
        sm: 'h-8 px-2.5 text-xs',
        lg: 'h-10 px-4 text-sm',
      },
      orientation: {
        horizontal: '',
        vertical: 'w-full justify-start',
      },
    },
    compoundVariants: [
      {
        variant: 'underline',
        orientation: 'vertical',
        class: 'border-b-0 border-r-2 -mr-px',
      },
    ],
    defaultVariants: {
      variant: 'segmented',
      size: 'default',
      orientation: 'horizontal',
    },
  },
)

export type TabsListVariants = VariantProps<typeof tabsListVariants>

export type TabsTriggerVariants = VariantProps<typeof tabsTriggerVariants>
