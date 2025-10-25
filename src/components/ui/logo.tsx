import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeConfig = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 }
  }

  const { width, height } = sizeConfig[size]

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/resio-logo-svg.svg"
        alt="RESIO Alojamientos"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
    </div>
  )
}