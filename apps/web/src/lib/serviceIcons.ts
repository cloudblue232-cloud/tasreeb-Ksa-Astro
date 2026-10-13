/** Emoji fallback icons for services that don't have an uploaded image yet. */
export const SERVICE_ICONS: Record<string, string> = {
  'kashf-tasaroubat-almaya': '🔍',
  'azl-alsotouh-waljedran': '🏗️',
  'azl-alkhazanat-walmasabeh': '🏊',
  'kashf-tasaroubat-algaz': '⚠️',
  'moualajat-alrotuba-wa-izalat-alaofoun': '💧',
  'syanat-wa-islah-tasaroubat-alsibaka': '🔧',
}

export const serviceIcon = (slug: string) => SERVICE_ICONS[slug] ?? '🛠️'
