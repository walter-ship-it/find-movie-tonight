import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function LoadingSkeletonTable() {
  return (
    <div className={cn(
      "space-y-4 p-4 rounded-xl",
      "glass-card"
    )}>
      {/* Header skeleton */}
      <div className="flex gap-4 border-b border-primary/10 pb-4">
        <Skeleton className="w-[60px] h-6" />
        <Skeleton className="flex-1 h-6" />
        <Skeleton className="w-[60px] h-6" />
        <Skeleton className="w-[80px] h-6" />
        <Skeleton className="w-[150px] h-6" />
        <Skeleton className="w-[80px] h-6" />
        <Skeleton className="w-[100px] h-6" />
      </div>
      {/* Row skeletons with staggered animation */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div 
          key={i} 
          className="flex gap-4 items-center animate-reveal-item"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <Skeleton className="w-[48px] h-[72px] rounded" />
          <Skeleton className="flex-1 h-6" />
          <Skeleton className="w-[60px] h-6" />
          <Skeleton className="w-[80px] h-6" />
          <div className="flex gap-1 w-[150px]">
            <Skeleton className="w-16 h-5 rounded-full" />
            <Skeleton className="w-16 h-5 rounded-full" />
          </div>
          <Skeleton className="w-[80px] h-6" />
          <Skeleton className="w-[100px] h-6" />
        </div>
      ))}
    </div>
  )
}

export function LoadingSkeletonCards() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div 
          key={i} 
          className={cn(
            "rounded-xl p-4",
            "glass-card",
            "animate-reveal-item"
          )}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex gap-4">
            <Skeleton className="w-[48px] h-[72px] rounded flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-5 w-16" />
              <div className="flex gap-1">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
