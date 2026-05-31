import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'dietary' | 'allergen' | 'featured' | 'pairing'
  className?: string
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  dietary:
    'bg-emerald-950/60 border border-emerald-700/40 text-emerald-400 text-[10px] font-semibold tracking-widest uppercase',
  allergen:
    'bg-amber-950/60 border border-amber-700/40 text-amber-400 text-[10px] font-medium tracking-wide uppercase',
  featured:
    'bg-gold/10 border border-gold/30 text-gold text-[10px] font-semibold tracking-widest uppercase',
  pairing:
    'bg-purple-950/40 border border-purple-700/30 text-purple-300 text-[10px] font-medium tracking-wide uppercase',
}

export function Badge({ children, variant = 'dietary', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
