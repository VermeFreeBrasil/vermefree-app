import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Botão do design system VermeFree: cápsula, 54px de altura mínima, peso 650.
const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full font-[650] transition-[background-color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none focus-visible:ring-[3px] focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [@media(hover:hover)]:hover:-translate-y-0.5 motion-reduce:transform-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        dark: "bg-primary text-primary-foreground [@media(hover:hover)]:hover:bg-[#24593e]",
        lime: "bg-accent text-accent-foreground [@media(hover:hover)]:hover:bg-[#d1e8b2]",
        outline: "border border-border bg-card text-foreground [@media(hover:hover)]:hover:bg-selected",
        ghost: "text-foreground [@media(hover:hover)]:hover:bg-selected",
        link: "text-primary underline underline-offset-4",
      },
      size: {
        default: "min-h-[54px] px-7 text-base",
        sm: "min-h-11 px-5 text-sm",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "dark", size: "default" },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button"
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
