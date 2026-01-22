import { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface TrailOrb {
  x: number
  y: number
  scale: number
  opacity: number
}

export function FuturisticCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorRingRef = useRef<HTMLDivElement>(null)
  const cursorOuterRef = useRef<HTMLDivElement>(null)
  const trailsRef = useRef<HTMLDivElement>(null)

  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isMagnetic, setIsMagnetic] = useState(false)

  const mousePos = useRef({ x: 0, y: 0 })
  const cursorPos = useRef({ x: 0, y: 0 })
  const ringPos = useRef({ x: 0, y: 0 })
  const outerPos = useRef({ x: 0, y: 0 })
  const trails = useRef<TrailOrb[]>(Array(8).fill(null).map(() => ({ x: 0, y: 0, scale: 1, opacity: 0.5 })))
  const magnetTarget = useRef<{ x: number; y: number } | null>(null)
  const rafId = useRef<number>()

  const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor

  const animate = useCallback(() => {
    const targetX = magnetTarget.current?.x ?? mousePos.current.x
    const targetY = magnetTarget.current?.y ?? mousePos.current.y

    // Main cursor - fastest
    cursorPos.current.x = lerp(cursorPos.current.x, targetX, 0.35)
    cursorPos.current.y = lerp(cursorPos.current.y, targetY, 0.35)

    // Ring - medium speed
    ringPos.current.x = lerp(ringPos.current.x, targetX, 0.15)
    ringPos.current.y = lerp(ringPos.current.y, targetY, 0.15)

    // Outer ring - slowest
    outerPos.current.x = lerp(outerPos.current.x, targetX, 0.08)
    outerPos.current.y = lerp(outerPos.current.y, targetY, 0.08)

    // Update trails with staggered delay
    trails.current.forEach((trail, i) => {
      const delay = (i + 1) * 0.03
      trail.x = lerp(trail.x, targetX, 0.1 - delay)
      trail.y = lerp(trail.y, targetY, 0.1 - delay)
    })

    // Apply transforms
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${cursorPos.current.x}px, ${cursorPos.current.y}px)`
    }
    if (cursorRingRef.current) {
      cursorRingRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`
    }
    if (cursorOuterRef.current) {
      outerPos.current.x = lerp(outerPos.current.x, targetX, 0.06)
      outerPos.current.y = lerp(outerPos.current.y, targetY, 0.06)
      cursorOuterRef.current.style.transform = `translate(${outerPos.current.x}px, ${outerPos.current.y}px)`
    }

    // Update trail elements
    if (trailsRef.current) {
      const trailElements = trailsRef.current.children
      trails.current.forEach((trail, i) => {
        if (trailElements[i]) {
          const el = trailElements[i] as HTMLElement
          el.style.transform = `translate(${trail.x}px, ${trail.y}px)`
        }
      })
    }

    rafId.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    // Check for touch device
    if ('ontouchstart' in window) return

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }

      // Check for magnetic targets
      const target = e.target as HTMLElement
      const magneticEl = target.closest('a, button, [role="button"], input, select, .magnetic')

      if (magneticEl) {
        const rect = magneticEl.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        // Magnetic pull strength
        const pullStrength = 0.3
        magnetTarget.current = {
          x: e.clientX + (centerX - e.clientX) * pullStrength,
          y: e.clientY + (centerY - e.clientY) * pullStrength
        }
        setIsMagnetic(true)
      } else {
        magnetTarget.current = null
        setIsMagnetic(false)
      }
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('a, button, [role="button"], input, select, .hoverable')) {
        setIsHovering(true)
      }
    }

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('a, button, [role="button"], input, select, .hoverable')) {
        setIsHovering(false)
      }
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)

    rafId.current = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [animate])

  // Don't render on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden hidden md:block">
      {/* Trail orbs */}
      <div ref={trailsRef} className="absolute inset-0">
        {trails.current.map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-full",
              "bg-gradient-to-r from-primary/30 to-secondary/30",
              "blur-sm transition-opacity duration-300"
            )}
            style={{
              width: `${8 - i * 0.5}px`,
              height: `${8 - i * 0.5}px`,
              opacity: 0.6 - i * 0.07,
            }}
          />
        ))}
      </div>

      {/* Outer glow ring */}
      <div
        ref={cursorOuterRef}
        className={cn(
          "absolute -translate-x-1/2 -translate-y-1/2 rounded-full",
          "border border-primary/20 transition-all duration-500",
          isHovering && "scale-150 border-secondary/40",
          isClicking && "scale-75",
          isMagnetic && "border-accent/50"
        )}
        style={{
          width: '80px',
          height: '80px',
          background: 'radial-gradient(circle, transparent 30%, hsl(var(--primary) / 0.05) 100%)',
        }}
      />

      {/* Middle ring with rotation */}
      <div
        ref={cursorRingRef}
        className={cn(
          "absolute -translate-x-1/2 -translate-y-1/2 rounded-full",
          "border-2 border-dashed transition-all duration-300",
          isHovering ? "border-secondary scale-125 animate-spin-slow" : "border-primary/50",
          isClicking && "scale-90 border-accent",
          isMagnetic && "border-accent"
        )}
        style={{
          width: '40px',
          height: '40px',
        }}
      />

      {/* Core cursor */}
      <div
        ref={cursorRef}
        className={cn(
          "absolute -translate-x-1/2 -translate-y-1/2 rounded-full",
          "transition-all duration-200",
          isHovering && "scale-150",
          isClicking && "scale-75"
        )}
      >
        {/* Inner glow */}
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-md transition-all duration-300",
            isHovering ? "bg-secondary" : "bg-primary",
            isClicking && "bg-accent"
          )}
          style={{ width: '12px', height: '12px', margin: '-2px' }}
        />

        {/* Core dot */}
        <div
          className={cn(
            "relative rounded-full transition-all duration-200",
            isHovering ? "bg-secondary" : "bg-primary",
            isClicking && "bg-accent"
          )}
          style={{ width: '8px', height: '8px' }}
        />

        {/* Crosshair lines */}
        <div className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "transition-all duration-300",
          isHovering ? "opacity-100 scale-100" : "opacity-0 scale-50"
        )}>
          <div className="absolute w-6 h-[1px] bg-secondary/80 -left-3 top-0" />
          <div className="absolute h-6 w-[1px] bg-secondary/80 top-[-12px] left-0" />
        </div>
      </div>

      {/* Click ripple effect */}
      {isClicking && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping"
          style={{
            left: cursorPos.current.x,
            top: cursorPos.current.y,
            width: '60px',
            height: '60px',
            border: '2px solid hsl(var(--accent))',
          }}
        />
      )}
    </div>
  )
}
