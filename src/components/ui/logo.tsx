interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  }

  return (
    <div className={`font-bold text-foreground ${sizeClasses[size]} ${className}`}>
      <span>R⋮</span>
      <span>SIO</span>
    </div>
  )
}