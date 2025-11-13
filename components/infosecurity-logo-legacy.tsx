import Image from "next/image"

interface InfoSecurityLogoProps {
  size?: "small" | "medium" | "large"
  useIconLogo?: boolean
}

export function InfoSecurityLogo({ size = "medium", useIconLogo = false }: InfoSecurityLogoProps) {
  const dimensions = {
    small: { width: 80, height: 80 },
    medium: { width: 1040, height: 1040 },
    large: { width: 220, height: 220 },
  }

  const { width, height } = dimensions[size]

  const logoSrc = useIconLogo ? "/logo.png" : "/logo.png"
  const borderRadiusClass = useIconLogo ? "rounded-lg" : ""

  return (
    <div className="flex items-center justify-center">
      <Image
        src={logoSrc || "/placeholder.svg"}
        alt="Info Security - Plataforma de Segurança e Denúncias"
        width={width}
        height={height}
        priority
        className={`object-contain ${borderRadiusClass}`}
      />
    </div>
  )
}
