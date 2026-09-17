import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_8px_24px_rgba(207,161,59,0.28)] hover:brightness-110 hover:shadow-[0_10px_32px_rgba(207,161,59,0.4)]',
        destructive:
          'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50',
        outline:
          'bg-white/[0.02] border border-border text-foreground backdrop-blur-sm hover:bg-white/5 hover:border-primary/30',
        secondary:
          'bg-secondary text-secondary-foreground border border-secondary hover:brightness-110',
        ghost:
          'text-muted-foreground bg-transparent hover:text-primary hover:bg-primary/10',
        link: 'text-primary underline-offset-4 hover:underline uppercase tracking-wide',
      },
      size: {
        default: 'min-h-11 px-6 py-2.5 has-[>svg]:px-4',
        sm: 'min-h-9 rounded-lg gap-1.5 px-4 py-2 text-xs has-[>svg]:px-3',
        lg: 'min-h-[52px] rounded-xl px-8 py-3.5 text-[0.9375rem] has-[>svg]:px-6',
        icon: 'size-11',
        'icon-sm': 'size-9',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
