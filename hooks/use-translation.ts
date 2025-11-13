import { useSettings } from "@/contexts/settings-context"
import { translations, type TranslationKey } from "@/lib/translations"

export function useTranslation() {
  const { settings } = useSettings()

  const t = (key: TranslationKey): string => {
    return translations[settings.language][key] || key
  }

  return { t, language: settings.language }
}
