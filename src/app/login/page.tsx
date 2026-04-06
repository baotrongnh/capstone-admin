"use client"

import { LoginForm } from "@/components/login-form"
import { getDefaultRouteByRole } from "@/constant/routes"
import { useAuthStore } from "@/stores/auth.store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
  const router = useRouter()
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const userRole = useAuthStore((state) => state.user?.role)

  useEffect(() => {
    if (!isHydrated || !isAuthenticated || !userRole) {
      return
    }

    const targetPath = getDefaultRouteByRole(userRole)
    if (targetPath) {
      router.replace(targetPath)
    }
  }, [isAuthenticated, isHydrated, router, userRole])

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  )
}
