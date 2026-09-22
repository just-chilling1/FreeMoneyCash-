import Image from 'next/image'
import Link from 'next/link'

type BrandLogoProps = {
  /** Height of the icon in px; text scales with it. */
  size?: 'sm' | 'md'
  href?: string
  className?: string
}

const SIZES = {
  sm: { icon: 'h-10', line1: 'text-[15px]', line2: 'text-[9px] tracking-[0.28em]' },
  md: { icon: 'h-14', line1: 'text-lg', line2: 'text-[11px] tracking-[0.3em]' },
} as const

export function BrandLogo({ size = 'md', href = '/dashboard', className = '' }: BrandLogoProps) {
  const s = SIZES[size]
  return (
    <Link
      href={href}
      aria-label="Free Money Cash dashboard"
      className={`flex min-w-0 items-center gap-3 hover:opacity-90 ${className}`}
    >
      <Image
        src="/icon.png"
        alt=""
        width={231}
        height={400}
        className={`${s.icon} w-auto shrink-0 object-contain`}
        priority
      />
      <span className="flex min-w-0 flex-col leading-none">
        <span className={`${s.line1} whitespace-nowrap font-black uppercase tracking-tight text-foreground`}>
          Free&nbsp;Money
        </span>
        <span className={`${s.line2} mt-1 whitespace-nowrap font-bold uppercase text-primary`}>Cash</span>
      </span>
    </Link>
  )
}
