import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 ease-expo-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Original variants (unchanged for backwards compatibility)
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        
        // Y2K Neon variants
        neonPink: [
          "border-pink-500/50 bg-pink-500/20 text-pink-300",
          "shadow-[0_0_10px_rgba(236,72,153,0.3)]",
          "hover:bg-pink-500/30 hover:shadow-[0_0_15px_rgba(236,72,153,0.5)]",
        ].join(" "),
        
        neonCyan: [
          "border-cyan-500/50 bg-cyan-500/20 text-cyan-300",
          "shadow-[0_0_10px_rgba(34,211,238,0.3)]",
          "hover:bg-cyan-500/30 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]",
        ].join(" "),
        
        neonPurple: [
          "border-purple-500/50 bg-purple-500/20 text-purple-300",
          "shadow-[0_0_10px_rgba(168,85,247,0.3)]",
          "hover:bg-purple-500/30 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]",
        ].join(" "),
        
        neonLime: [
          "border-lime-500/50 bg-lime-500/20 text-lime-300",
          "shadow-[0_0_10px_rgba(132,204,22,0.3)]",
          "hover:bg-lime-500/30 hover:shadow-[0_0_15px_rgba(132,204,22,0.5)]",
        ].join(" "),
        
        // Glass variant
        glass: [
          "border-white/20 bg-white/10 text-foreground",
          "backdrop-blur-sm",
          "hover:bg-white/20",
        ].join(" "),
        
        // Rating badge - special for IMDb ratings
        rating: [
          "border-yellow-500/50 bg-yellow-500/20 text-yellow-300",
          "shadow-[0_0_10px_rgba(234,179,8,0.3)]",
          "font-mono font-bold",
        ].join(" "),
        
        // Genre badge - subtle cyan
        genre: [
          "border-secondary/30 bg-secondary/10 text-secondary",
          "hover:bg-secondary/20 hover:border-secondary/50",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
