import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

const LOCALE_COOKIE = 'SEP_ADMIN_LOCALE'
const DEFAULT_LOCALE = 'vi'

export default getRequestConfig(async () => {
     const locale = (await cookies()).get(LOCALE_COOKIE)?.value ?? DEFAULT_LOCALE

     return {
          locale,
          messages: (await import(`../../messages/${locale}.json`)).default
     }
})
