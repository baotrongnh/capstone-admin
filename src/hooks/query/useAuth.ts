import { getDefaultRouteByRole } from "@/constant/routes"
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
            const targetPath = getDefaultRouteByRole(user.role)

            if (!targetPath) {
                message.error(t('loginError') || 'Có lỗi đã xảy ra!')
                return
            }

            router.push(targetPath)
            message.success(t('loginSuccess'))
        },
        onError: (error) => {
            message.error(t('loginError') || 'Có lỗi đã xảy ra!')
            console.error("Login failed", error)
        }
    })
}