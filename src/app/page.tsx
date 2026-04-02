"use client"

import { getDefaultRouteByRole } from "@/constant/routes"
import { useAuthStore } from "@/stores/auth.store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const router = useRouter()
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const userRole = useAuthStore((state) => state.user?.role)

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    if (!isAuthenticated || !userRole) {
      router.replace("/login")
      return
    }

    const targetPath = getDefaultRouteByRole(userRole)
    if (!targetPath) {
      router.replace("/login")
      return
    }

    router.replace(targetPath)
  }, [isAuthenticated, isHydrated, router, userRole])

  return null
}
