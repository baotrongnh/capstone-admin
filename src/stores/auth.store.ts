import { AuthState, AuthTokens } from "@/types/auth"
import { UserDetail } from "@/types/user"
import { create } from "zustand"

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isHydrated: false,

    setAuth: (user: UserDetail, tokens) => {
        localStorage.setItem('adminAccessToken', tokens.accessToken)
        localStorage.setItem('adminRefreshToken', tokens.refreshToken)
        localStorage.setItem('adminUser', JSON.stringify(user))
        set({ user, tokens, isAuthenticated: true })
    },
    setTokens: (tokens: AuthTokens) => {
        localStorage.setItem('adminAccessToken', tokens.accessToken)
        localStorage.setItem('adminRefreshToken', tokens.refreshToken)
    },
    logout: () => {
        localStorage.removeItem('adminAccessToken')
        localStorage.removeItem('adminRefreshToken')
        localStorage.removeItem('adminUser')
        set({ user: null, tokens: null, isAuthenticated: false })
    },
    hydrate: () => {
        const accessToken = localStorage.getItem('adminAccessToken')
        const refreshToken = localStorage.getItem('adminRefreshToken')
        const userStr = localStorage.getItem('adminUser')

        if (accessToken && refreshToken && userStr) {
            try {
                const user = JSON.parse(userStr)
                set({
                    user,
                    tokens: { accessToken, refreshToken },
                    isAuthenticated: true,
                    isHydrated: true,
                })
            } catch {
                set({ isHydrated: true })
            }
        } else {
            set({ isHydrated: true })
        }
    }
}))