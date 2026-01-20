import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 ease-expo-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Original variants (unchanged for backwards compatibility)
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        
        // Y2K Custom Variants
        neonPink: [
          "bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500",
          "bg-[length:200%_auto] hover:bg-[position:right_center]",
          "text-white font-bold border border-pink-400/50",
          "shadow-[0_0_15px_rgba(236,72,153,0.5)]",
          "hover:shadow-[0_0_25px_rgba(236,72,153,0.8)]",
        ].join(" "),
        
        neonCyan: [
          "bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400",
          "bg-[length:200%_auto] hover:bg-[position:right_center]",
          "text-white font-bold border border-cyan-400/50",
          "shadow-[0_0_15px_rgba(34,211,238,0.5)]",
          "hover:shadow-[0_0_25px_rgba(34,211,238,0.8)]",
        ].join(" "),
        
        neonPurple: [
          "bg-gradient-to-r from-purple-500 via-violet-500 to-purple-500",
          "bg-[length:200%_auto] hover:bg-[position:right_center]",
          "text-white font-bold border border-purple-400/50",
          "shadow-[0_0_15px_rgba(168,85,247,0.5)]",
          "hover:shadow-[0_0_25px_rgba(168,85,247,0.8)]",
        ].join(" "),
        
        glowOutline: [
          "bg-transparent border-2 border-primary",
          "text-primary hover:bg-primary/10",
          "shadow-[0_0_10px_hsl(var(--primary)/0.5)]",
          "hover:shadow-[0_0_20px_hsl(var(--primary)/0.8)]",
        ].join(" "),
        
        glass: [
          "bg-white/10 backdrop-blur-md",
          "border border-white/20",
          "text-foreground",
          "hover:bg-white/20 hover:border-white/30",
          "shadow-glass",
        ].join(" "),
        
        chrome: [
          "bg-gradient-to-b from-gray-100 via-gray-300 to-gray-400",
          "text-gray-900 font-semibold",
          "border border-gray-500",
          "shadow-inner",
          "hover:from-gray-200 hover:via-gray-400 hover:to-gray-500",
        ].join(" "),
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
