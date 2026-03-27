import { ROUTE_ADMIN, ROUTE_OPERATOR, ROUTE_STAFF } from "@/constant/routes"
import { authServices } from "@/lib/services/auth.service"
import { userService } from "@/lib/services/user.service"
import { useAuthStore } from "@/stores/auth.store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { message } from "antd"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

export const useLogin = () => {
    const t = useTranslations("Auth")
    const setTokens = useAuthStore((s) => s.setTokens)
    const setAuth = useAuthStore((s) => s.setAuth)
    const queryClient = useQueryClient()
    const router = useRouter()

    return useMutation({
        mutationFn: authServices.login,
        onSuccess: async (data) => {
            queryClient.clear()

            const tokens = data?.tokens
            if (!tokens) return
            setTokens(tokens)

            const user = await queryClient.fetchQuery({
                queryKey: ['user', 'profile'],
                queryFn: () => userService.getProfile()
            })
            setAuth(user, tokens)
            switch (user.role) {
                case 'admin':
                    router.push(`${ROUTE_ADMIN.DASHBOARD}`)
                    message.success(t('loginSuccess'))
                    break
                case 'operator':
                    router.push(`${ROUTE_OPERATOR.APARTMENT}`)
                    message.success(t('loginSuccess'))
                    break
                case 'staff':
                    router.push(`${ROUTE_STAFF.INQUIRY}`)
                    message.success(t('loginSuccess'))
                    break
                default:
                    message.error(t('loginError') || 'Có lỗi đã xảy ra!')
                    break
            }
        },
        onError: (error) => {
            message.error(t('loginError') || 'Có lỗi đã xảy ra!')
            console.error("Login failed", error)
        }
    })
}