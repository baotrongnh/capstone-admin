'use client'

import { useLocale } from "next-intl"
import { useRouter } from "next/navigation"

const LOCALE_COOKIE = 'SEP_ADMIN_LOCALE'

export function LanguageToggle() {
     const router = useRouter()
     const locale = useLocale()

     function toggle() {
          const next = locale === 'vi' ? 'en' : 'vi'
          document.cookie = `${LOCALE_COOKIE}=${next}; path=/`
          router.refresh()
     }

     return (
          <button
               onClick={toggle}
               className="cursor-pointer hover:opacity-75 transition-opacity text-xl leading-none"
               title={locale === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
          >
               {locale === 'vi' ? '🇻🇳' : '🇺🇸'}
          </button>
     )
}
