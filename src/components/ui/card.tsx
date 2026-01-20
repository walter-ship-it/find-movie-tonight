import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-lg border text-card-foreground transition-all duration-500 ease-expo-out",
  {
    variants: {
      variant: {
        default: "bg-card border-border shadow-sm",
        
        glass: [
          "bg-white/5 backdrop-blur-xl",
          "border border-white/10",
          "shadow-glass shadow-purple-500/5",
        ].join(" "),
        
        neon: [
          "bg-card border-2 border-primary/50",
          "shadow-[0_0_15px_hsl(var(--primary)/0.3)]",
          "hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)]",
          "hover:border-primary",
        ].join(" "),
        
        holographic: [
          "bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10",
          "border border-white/20",
          "backdrop-blur-sm",
          "hover:from-pink-500/20 hover:via-purple-500/20 hover:to-cyan-500/20",
        ].join(" "),
        
        movie: [
          "bg-card/80 backdrop-blur-sm",
          "border border-border/50",
          "overflow-hidden",
          "hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20",
          "hover:border-primary/50",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }
