import { InfoSecurityLogo } from "@/components/InfoSecurity-logo"

interface IconLogoHeaderProps {
  size?: "small" | "medium" | "large"
  showBrand?: boolean
}

export function IconLogoHeader({ size = "small", showBrand = false }: IconLogoHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">
        <InfoSecurityLogo size={size} useIconLogo />
      </div>
      {showBrand && (
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-white">Info Security</h1>
          <p className="text-xs text-muted-foreground">Segurança e Denúncia</p>
        </div>
      )}
    </div>
  )
}
